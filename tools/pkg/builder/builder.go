package builder

import (
	"fmt"
	"os"
	"path/filepath"

	"sitebuilder/pkg/config"
)

// Builder orchestrates the full site build
type Builder struct {
	isRelease  bool
	cleanBuild bool
	compress   bool
	onlyNew    bool
	pathToRoot string
	siteConfig config.SiteConfig
	projects   map[string]config.Project
	icons      map[string]config.Icon
}

// NewBuilder creates a Builder, loading all config files from the repo root
func NewBuilder(isRelease, cleanBuild, compress, onlyNew bool, pathToRoot string) (*Builder, error) {
	b := &Builder{
		isRelease:  isRelease,
		cleanBuild: cleanBuild,
		compress:   compress,
		onlyNew:    onlyNew,
		pathToRoot: pathToRoot,
	}

	configDir := filepath.Join(pathToRoot, "config")

	var err error
	b.siteConfig, err = config.LoadSiteConfig(filepath.Join(configDir, "Site.json"))
	if err != nil {
		return nil, fmt.Errorf("loading site config: %w", err)
	}

	b.projects, err = config.LoadProjects(filepath.Join(configDir, "Projects.json"))
	if err != nil {
		return nil, fmt.Errorf("loading projects: %w", err)
	}

	b.icons, err = config.LoadIcons(filepath.Join(configDir, "Icons.json"))
	if err != nil {
		return nil, fmt.Errorf("loading icons: %w", err)
	}

	return b, nil
}

// Build runs a full site build
func (b *Builder) Build() error {
	outputPath := filepath.Join(b.pathToRoot, b.siteConfig.Output_ViewsFolder)

	if b.cleanBuild {
		fmt.Println("\nCleaning output folder...")
		if err := os.RemoveAll(outputPath); err != nil {
			return fmt.Errorf("cleaning output: %w", err)
		}
	}

	if err := os.MkdirAll(outputPath, 0755); err != nil {
		return fmt.Errorf("creating output dir: %w", err)
	}

	// Build assets
	fmt.Println("\nBuilding assets...")
	ah := NewAssetHandler(b.pathToRoot, b.siteConfig, b.onlyNew)
	staticSrc := filepath.Join(b.pathToRoot, b.siteConfig.Raw_StaticFolder)
	staticDst := filepath.Join(b.pathToRoot, b.siteConfig.Output_StaticFolder)
	if err := ah.HandleFolder(staticSrc, staticDst); err != nil {
		fmt.Printf("Warning: asset build error: %v\n", err)
	}

	// Build pages
	fmt.Println("\nBuilding pages...")
	pb, err := NewPageBuilder(b.isRelease, b.pathToRoot, b.siteConfig, b.projects, b.icons)
	if err != nil {
		return fmt.Errorf("creating page builder: %w", err)
	}

	for _, proj := range b.projects {
		if proj.PagePath == nil {
			continue
		}
		if err := pb.BuildPage(*proj.PagePath); err != nil {
			fmt.Printf("  Warning: building page %s: %v\n", *proj.PagePath, err)
		}
	}

	// Copy non-template files from views folder
	fmt.Println("\nCopying non-template files from views folder...")
	viewsSrc := filepath.Join(b.pathToRoot, b.siteConfig.Raw_ViewsFolder)
	viewsDst := filepath.Join(b.pathToRoot, b.siteConfig.Output_ViewsFolder)
	if err := ah.HandleFolder(viewsSrc, viewsDst); err != nil {
		fmt.Printf("Warning: views copy error: %v\n", err)
	}

	return nil
}
