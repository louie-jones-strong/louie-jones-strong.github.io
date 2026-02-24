package tests

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"sitebuilder/pkg/config"
)

func repoRoot() string {
	_, filename, _, _ := runtime.Caller(0)
	// tools/tests/config_test.go -> go up 2 levels to repo root
	root := filepath.Join(filepath.Dir(filename), "..", "..")
	abs, _ := filepath.Abs(root)
	return abs
}

func TestIconConfigLoaded(t *testing.T) {
	icons, err := config.LoadIcons(filepath.Join(repoRoot(), "config", "Icons.json"))
	if err != nil {
		t.Fatalf("failed to load icons: %v", err)
	}
	if len(icons) == 0 {
		t.Error("icons config is empty")
	}

	for key, icon := range icons {
		key, icon := key, icon
		t.Run("Icon_"+key, func(t *testing.T) {
			if len(key) < 2 {
				t.Errorf("key %q too short", key)
			}
			if len(icon.Label) < 2 {
				t.Errorf("icon %q Label too short: %q", key, icon.Label)
			}
			if len(icon.IconPath) < 10 {
				t.Errorf("icon %q IconPath too short: %q", key, icon.IconPath)
			}
		})
	}
}

func TestSiteConfigLoaded(t *testing.T) {
	cfg, err := config.LoadSiteConfig(filepath.Join(repoRoot(), "config", "Site.json"))
	if err != nil {
		t.Fatalf("failed to load site config: %v", err)
	}

	t.Run("HostURL", func(t *testing.T) {
		if cfg.HostURL == "" {
			t.Error("HostURL is empty")
		}
		if !strings.HasPrefix(cfg.HostURL, "http") {
			t.Errorf("HostURL %q is not a valid URL", cfg.HostURL)
		}
	})

	t.Run("ContactLinks", func(t *testing.T) {
		cl := cfg.ContactLinks
		checkLink := func(name string, link *string) {
			t.Run("link_"+name, func(t *testing.T) {
				if link != nil && *link == "" {
					t.Errorf("link %q is empty string", name)
				}
			})
		}
		checkLink("LinkedIn", cl.LinkedIn)
		checkLink("GitHub", cl.GitHub)
		checkLink("ItchIo", cl.ItchIo)
		checkLink("Instagram", cl.Instagram)
		checkLink("Twitter", cl.Twitter)
		checkLink("LeetCode", cl.LeetCode)
		checkLink("Kaggle", cl.Kaggle)

		t.Run("Email", func(t *testing.T) {
			if cl.Email == nil || *cl.Email == "" {
				t.Error("Email is nil or empty")
			}
		})
	})
}

func TestProjectConfigLoaded(t *testing.T) {
	icons, err := config.LoadIcons(filepath.Join(repoRoot(), "config", "Icons.json"))
	if err != nil {
		t.Fatalf("failed to load icons: %v", err)
	}

	projects, err := config.LoadProjects(filepath.Join(repoRoot(), "config", "Projects.json"))
	if err != nil {
		t.Fatalf("failed to load projects: %v", err)
	}
	if len(projects) == 0 {
		t.Error("projects config is empty")
	}

	earliest := time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)
	latest := time.Now().AddDate(1, 0, 0)

	for key, proj := range projects {
		key, proj := key, proj
		t.Run("Project_"+key, func(t *testing.T) {
			if len(key) <= 3 {
				t.Errorf("key %q too short", key)
			}
			if len(proj.Title) < 3 {
				t.Errorf("Title too short: %q", proj.Title)
			}
			if proj.Thumbnail != nil && len(*proj.Thumbnail) < 10 {
				t.Errorf("Thumbnail too short: %q", *proj.Thumbnail)
			}

			t.Run("QuickDescription", func(t *testing.T) {
				qd := proj.QuickDescription
				if len(qd) < 10 {
					t.Errorf("QuickDescription too short: %q", qd)
				}
				if strings.Contains(qd, "\n") {
					t.Error("QuickDescription contains newline")
				}
				if !strings.HasSuffix(qd, ".") {
					t.Errorf("QuickDescription doesn't end with '.': %q", qd)
				}
				if len(qd) > 0 && strings.ToUpper(qd[:1]) != qd[:1] {
					t.Errorf("QuickDescription doesn't start with capital: %q", qd)
				}
				if strings.Contains(qd, "  ") {
					t.Errorf("QuickDescription has double spaces: %q", qd)
				}
				if strings.Contains(qd, " i ") {
					t.Errorf("QuickDescription has lowercase 'i': %q", qd)
				}
			})

			t.Run("Dates", func(t *testing.T) {
				checkDate := func(s string) time.Time {
					if s == "Current" {
						return time.Now()
					}
					formats := []string{
						"January 2, 2006",
						"January 2006",
						"2006-01-02",
						"Jan 2, 2006",
						"Jan 2006",
						"January, 2006",
						"January, 2 2006",
					}
					for _, f := range formats {
						d, err := time.Parse(f, s)
						if err == nil {
							return d
						}
					}
					t.Errorf("invalid date: %q", s)
					return time.Time{}
				}

				var lastStart, lastEnd *time.Time
				for _, tl := range proj.Timelines {
					start := checkDate(tl.StartDate)
					if start.IsZero() {
						continue
					}
					if start.Before(earliest) || start.After(latest) {
						t.Errorf("start date out of range: %v", start)
					}

					if tl.EndDate != "" {
						end := checkDate(tl.EndDate)
						if tl.EndDate == "Current" {
							end = latest
						}
						if end.Before(start) {
							t.Errorf("end date %v before start %v", end, start)
						}
						if lastEnd != nil {
							if start.Before(*lastEnd) {
								t.Errorf("overlapping timelines: start %v before lastEnd %v", start, *lastEnd)
							}
						}
						lastEnd = &end
					} else if lastStart != nil {
						if start.Before(*lastStart) {
							t.Errorf("start %v before lastStart %v", start, *lastStart)
						}
					}
					lastStart = &start
				}
			})

			t.Run("Skills", func(t *testing.T) {
				skills := proj.Skills
				seen := make(map[string]bool)
				for _, skill := range skills {
					if seen[skill] {
						t.Errorf("duplicate skill: %q", skill)
					}
					seen[skill] = true
					if _, ok := icons[skill]; !ok {
						t.Errorf("skill %q not in icons config", skill)
					}
				}

				// Check subproject skills are included
				for _, subKey := range proj.SubProjects {
					sub, ok := projects[subKey]
					if !ok {
						continue
					}
					for _, subSkill := range sub.Skills {
						if !seen[subSkill] {
							t.Errorf("skill %q from subproject %q not in parent project %q", subSkill, subKey, key)
						}
					}
				}
			})

			t.Run("SubProjects", func(t *testing.T) {
				for _, subKey := range proj.SubProjects {
					if len(subKey) < 3 {
						t.Errorf("subproject key too short: %q", subKey)
					}
					if _, ok := projects[subKey]; !ok {
						t.Errorf("subproject %q not in projects config", subKey)
					}
				}
			})

			t.Run("PagePath_Link", func(t *testing.T) {
				if proj.PagePath != nil && len(*proj.PagePath) < 3 {
					t.Errorf("PagePath too short: %q", *proj.PagePath)
				}
				if proj.Link != nil && len(*proj.Link) < 10 {
					t.Errorf("Link too short: %q", *proj.Link)
				}
			})

			t.Run("Awards", func(t *testing.T) {
				if proj.Awards != nil {
					if s, ok := proj.Awards.(string); ok {
						if len(s) < 1 {
							t.Errorf("Awards string too short: %q", s)
						}
					}
				}
			})

			t.Run("Links", func(t *testing.T) {
				rawData, _ := os.ReadFile(filepath.Join(repoRoot(), "config", "Projects.json"))
				var rawProjects map[string]json.RawMessage
				if err := json.Unmarshal(rawData, &rawProjects); err != nil {
					return
				}
				rawProj := rawProjects[key]
				var projMap map[string]json.RawMessage
				if err := json.Unmarshal(rawProj, &projMap); err != nil {
					return
				}
				linksRaw, ok := projMap["Links"]
				if !ok {
					t.Error("Links field missing")
					return
				}
				var links map[string]string
				if err := json.Unmarshal(linksRaw, &links); err != nil {
					return // empty object or null
				}
				for linkKey, link := range links {
					if len(link) < 3 {
						t.Errorf("link %q too short: %q", linkKey, link)
					}
				}
			})
		})
	}
}
