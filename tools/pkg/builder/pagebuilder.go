package builder

import (
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strings"
	"time"

	"sitebuilder/pkg/config"
	"sitebuilder/pkg/templatefuncs"
)

// PageBuilder builds individual HTML pages from templates
type PageBuilder struct {
	isRelease  bool
	pathToRoot string
	siteConfig config.SiteConfig
	projects   map[string]config.Project
	icons      map[string]config.Icon
	baseTmpl   *template.Template
}

// NewPageBuilder creates a new PageBuilder and loads component templates
func NewPageBuilder(isRelease bool, pathToRoot string, siteConfig config.SiteConfig,
	projects map[string]config.Project, icons map[string]config.Icon) (*PageBuilder, error) {

	pb := &PageBuilder{
		isRelease:  isRelease,
		pathToRoot: pathToRoot,
		siteConfig: siteConfig,
		projects:   projects,
		icons:      icons,
	}

	if err := pb.loadComponentTemplates(); err != nil {
		return nil, err
	}

	return pb, nil
}

func (pb *PageBuilder) loadComponentTemplates() error {
	pb.baseTmpl = template.New("base").Funcs(templatefuncs.FuncMap())

	compDir := filepath.Join(pb.pathToRoot, pb.siteConfig.Raw_ViewsFolder, "Components")
	entries, err := os.ReadDir(compDir)
	if err != nil {
		return fmt.Errorf("reading components dir: %w", err)
	}

	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".html") {
			continue
		}
		filePath := filepath.Join(compDir, e.Name())
		content, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("reading component %s: %w", e.Name(), err)
		}
		if _, err := pb.baseTmpl.Parse(string(content)); err != nil {
			return fmt.Errorf("parsing component %s: %w", e.Name(), err)
		}
	}

	return nil
}

// BuildPage renders a single page template to the output directory
func (pb *PageBuilder) BuildPage(pagePath string) error {
	sourcePath := filepath.Join(pb.pathToRoot, pb.siteConfig.Raw_ViewsFolder, pagePath+".html")
	outputPath := filepath.Join(pb.pathToRoot, pb.siteConfig.Output_ViewsFolder, pagePath+".html")

	stat, err := os.Stat(sourcePath)
	if err != nil {
		return fmt.Errorf("stat source %s: %w", sourcePath, err)
	}
	if !stat.Mode().IsRegular() {
		return fmt.Errorf("not a regular file: %s", sourcePath)
	}

	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		return fmt.Errorf("creating output dir: %w", err)
	}

	pageName := filepath.Base(pagePath)
	pageParent := filepath.Dir(pagePath)

	// Count depth for pathToRoot
	parts := strings.Split(pagePath, "/")
	depth := len(parts) - 1
	pathToRoot := strings.Repeat("../", depth)

	// Get project data for this page
	var projectData config.Project
	for _, proj := range pb.projects {
		if proj.PagePath != nil && *proj.PagePath == pagePath {
			projectData = proj
			break
		}
	}

	pageData := config.PageData{
		IsRelease:   pb.isRelease,
		PageName:    pageName,
		PageParent:  pageParent,
		PathToRoot:  pathToRoot,
		SiteConfig:  pb.siteConfig,
		Projects:    pb.projects,
		Icons:       pb.icons,
		CurrentDate: time.Now().Format("2006-01-02"),
	}

	ctx := config.PageContext{
		PageData:    pageData,
		ProjectData: projectData,
	}

	content, err := os.ReadFile(sourcePath)
	if err != nil {
		return fmt.Errorf("reading page %s: %w", sourcePath, err)
	}

	// Clone the base template and parse the page
	tmpl, err := pb.baseTmpl.Clone()
	if err != nil {
		return fmt.Errorf("cloning template: %w", err)
	}

	tmpl, err = tmpl.New("page").Parse(string(content))
	if err != nil {
		return fmt.Errorf("parsing page template %s: %w", pagePath, err)
	}

	outFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("creating output file: %w", err)
	}
	defer outFile.Close()

	fmt.Printf("  %s -> %s\n", sourcePath, outputPath)

	if err := tmpl.ExecuteTemplate(outFile, "page", ctx); err != nil {
		return fmt.Errorf("executing template %s: %w", pagePath, err)
	}

	return nil
}
