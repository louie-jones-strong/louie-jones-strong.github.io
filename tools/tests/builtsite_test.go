package tests

import (
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"sitebuilder/pkg/config"
)

func TestBuiltSite(t *testing.T) {
	root := repoRoot()
	siteConfig, err := config.LoadSiteConfig(filepath.Join(root, "config", "Site.json"))
	if err != nil {
		t.Fatalf("loading site config: %v", err)
	}
	projects, err := config.LoadProjects(filepath.Join(root, "config", "Projects.json"))
	if err != nil {
		t.Fatalf("loading projects: %v", err)
	}

	outDir := filepath.Join(root, siteConfig.Output_ViewsFolder)

	t.Run("CV_Download", func(t *testing.T) {
		cvPath := filepath.Join(outDir, "CV.pdf")
		exists := fileExists(cvPath)
		if siteConfig.ContactLinks.CVDownloadAllowed && !exists {
			t.Errorf("CV.pdf missing but CVDownloadAllowed=true")
		}
		if !siteConfig.ContactLinks.CVDownloadAllowed && exists {
			t.Errorf("CV.pdf exists but CVDownloadAllowed=false")
		}
	})

	for key, proj := range projects {
		if proj.PagePath == nil {
			continue
		}
		key, proj := key, proj
		pagePath := filepath.Join(outDir, *proj.PagePath+".html")
		t.Run("Page_"+key, func(t *testing.T) {
			checkPage(t, pagePath, outDir)
		})
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func checkPage(t *testing.T, pagePath, outDir string) {
	t.Helper()

	if !fileExists(pagePath) {
		t.Errorf("page does not exist: %s", pagePath)
		return
	}

	content, err := os.ReadFile(pagePath)
	if err != nil {
		t.Errorf("reading page %s: %v", pagePath, err)
		return
	}
	page := string(content)

	t.Run("href_links", func(t *testing.T) {
		re := regexp.MustCompile(`href="([^"]*)"`)
		matches := re.FindAllStringSubmatch(page, -1)
		for _, m := range matches {
			checkLocalPath(t, pagePath, m[1], outDir)
		}
	})

	t.Run("src_links", func(t *testing.T) {
		re := regexp.MustCompile(`src="([^"]*)"`)
		matches := re.FindAllStringSubmatch(page, -1)
		for _, m := range matches {
			checkLocalPath(t, pagePath, m[1], outDir)
		}
	})

	t.Run("srcset_links", func(t *testing.T) {
		re := regexp.MustCompile(`srcset="([^"]*)"`)
		matches := re.FindAllStringSubmatch(page, -1)
		for _, m := range matches {
			srcs := strings.Split(m[1], ",")
			for _, src := range srcs {
				parts := strings.Fields(strings.TrimSpace(src))
				if len(parts) > 0 {
					checkLocalPath(t, pagePath, parts[0], outDir)
				}
			}
		}
	})

	t.Run("img_alts", func(t *testing.T) {
		imgRe := regexp.MustCompile(`<img[^>]*>`)
		altRe := regexp.MustCompile(`alt="[^"]*"`)
		imgs := imgRe.FindAllString(page, -1)
		for _, img := range imgs {
			if !altRe.MatchString(img) {
				t.Errorf("img missing alt: %s", img)
			}
		}
	})

	checkTextTags(t, page)
}

func checkLocalPath(t *testing.T, pagePath, localPath, outDir string) {
	t.Helper()
	if localPath == "" {
		return
	}
	if strings.HasPrefix(localPath, "http://") || strings.HasPrefix(localPath, "https://") {
		_, err := url.ParseRequestURI(localPath)
		if err != nil {
			t.Errorf("invalid URL: %s", localPath)
		}
		return
	}
	if strings.HasPrefix(localPath, "mailto:") {
		email := strings.TrimPrefix(localPath, "mailto:")
		if !strings.Contains(email, "@") {
			t.Errorf("invalid email: %s", email)
		}
		return
	}
	if strings.HasPrefix(localPath, "#") {
		return
	}

	var localFile string
	if strings.HasPrefix(localPath, "../") {
		localFile = filepath.Join(filepath.Dir(pagePath), localPath)
	} else {
		localFile = filepath.Join(outDir, localPath)
	}

	if !fileExists(localFile) {
		t.Errorf("file does not exist: %s (from %s)", localFile, pagePath)
		return
	}

	if !strings.HasPrefix(localFile, outDir) {
		t.Errorf("file outside output dir: %s", localPath)
	}

	allowedExts := []string{".js", ".css", ".html", ".ico", ".svg", ".png", ".webp", ".mp4", ".webm", ".pdf"}
	ext := strings.ToLower(filepath.Ext(localFile))
	for _, allowed := range allowedExts {
		if ext == allowed {
			return
		}
	}
	t.Errorf("disallowed extension %s: %s", ext, localFile)
}

func checkTextTags(t *testing.T, page string) {
	type textCheck struct {
		tag         string
		minLen      int
		requireWord  bool
		requirePunct bool
	}
	checks := []textCheck{
		{"h1", 5, false, false},
		{"h2", 4, false, false},
		{"h3", 3, false, false},
		{"h4", 1, false, false},
		{"h5", 1, false, false},
		{"h6", 4, false, false},
		{"p", 4, true, true},
		{"a", 4, false, false},
	}

	for _, c := range checks {
		c := c
		t.Run("text_"+c.tag, func(t *testing.T) {
			re := regexp.MustCompile(fmt.Sprintf(`<%s[^>]*>([^<]*)</%s>`, c.tag, c.tag))
			matches := re.FindAllStringSubmatch(page, -1)
			for _, m := range matches {
				text := strings.TrimSpace(m[1])
				if text == "" {
					continue
				}
				checkText(t, text, c.tag, c.minLen, c.requireWord, c.requirePunct)
			}
		})
	}
}

func checkText(t *testing.T, text, context string, minLen int, requireWord, requirePunct bool) {
	t.Helper()
	if len(text) < minLen {
		t.Errorf("(%s) text too short %q", context, text)
		return
	}
	if strings.Contains(text, "  ") {
		t.Errorf("(%s) double space in %q", context, text)
	}
	if requireWord && !strings.Contains(text, " ") {
		t.Errorf("(%s) only one word: %q", context, text)
	}
	if requirePunct {
		valid := strings.HasSuffix(text, ".") || strings.HasSuffix(text, "?") ||
			strings.HasSuffix(text, "!") || strings.HasSuffix(text, ":")
		if !valid {
			t.Errorf("(%s) missing punctuation: %q", context, text)
		}
	}
	if strings.Contains(text, " i ") {
		t.Errorf("(%s) lowercase 'i': %q", context, text)
	}
}
