package builder

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"sitebuilder/pkg/config"
)

// AssetHandler copies and processes static assets
type AssetHandler struct {
	pathToRoot string
	siteConfig config.SiteConfig
	onlyNew    bool
}

// NewAssetHandler creates a new AssetHandler
func NewAssetHandler(pathToRoot string, siteConfig config.SiteConfig, onlyNew bool) *AssetHandler {
	return &AssetHandler{
		pathToRoot: pathToRoot,
		siteConfig: siteConfig,
		onlyNew:    onlyNew,
	}
}

// HandleFolder recursively processes a folder of assets
func (ah *AssetHandler) HandleFolder(inputPath, outputPath string) error {
	if ah.isFolderToSkip(inputPath) {
		fmt.Printf("  Skip folder: %s\n", inputPath)
		return nil
	}

	if err := os.MkdirAll(outputPath, 0755); err != nil {
		return fmt.Errorf("creating dir %s: %w", outputPath, err)
	}

	entries, err := os.ReadDir(inputPath)
	if err != nil {
		return fmt.Errorf("reading dir %s: %w", inputPath, err)
	}

	for _, entry := range entries {
		inPath := filepath.Join(inputPath, entry.Name())
		outPath := filepath.Join(outputPath, entry.Name())

		if entry.IsDir() {
			if err := ah.HandleFolder(inPath, outPath); err != nil {
				fmt.Printf("  Warning: %v\n", err)
			}
		} else {
			if err := ah.HandleFile(inPath, outPath); err != nil {
				fmt.Printf("  Warning handling %s: %v\n", inPath, err)
			}
		}
	}
	return nil
}

func (ah *AssetHandler) isFolderToSkip(folderPath string) bool {
	staticBase := filepath.Join(ah.pathToRoot, ah.siteConfig.Raw_StaticFolder)
	rel, err := filepath.Rel(staticBase, folderPath)
	if err != nil {
		return false
	}
	rel = filepath.ToSlash(rel)
	for _, skip := range ah.siteConfig.AssetConfig.NoCopyFolders {
		if rel == skip {
			return true
		}
	}
	return false
}

// HandleFile processes a single asset file
func (ah *AssetHandler) HandleFile(inputPath, outputPath string) error {
	ext := strings.ToLower(filepath.Ext(inputPath))

	switch ext {
	case ".ejs", ".html":
		// Skip template files
		return nil
	case ".scss":
		// Compile SCSS to CSS
		cssPath := strings.TrimSuffix(outputPath, ext) + ".css"
		return ah.compileSCSS(inputPath, cssPath)
	default:
		// Copy everything else
		if ah.onlyNew {
			if _, err := os.Stat(outputPath); err == nil {
				return nil
			}
		}
		return copyFile(inputPath, outputPath)
	}
}

func (ah *AssetHandler) compileSCSS(inputPath, outputPath string) error {
	cmd := exec.Command("sass", "--no-source-map", inputPath, outputPath)
	if err := cmd.Run(); err != nil {
		// Fallback: try to find a precompiled CSS file alongside the SCSS
		precompiled := strings.Replace(outputPath,
			filepath.Join(ah.pathToRoot, ah.siteConfig.Output_StaticFolder),
			filepath.Join(ah.pathToRoot, ah.siteConfig.Raw_StaticFolder),
			1)
		precompiled = strings.TrimSuffix(precompiled, ".css") + ".css"
		if _, err2 := os.Stat(precompiled); err2 == nil {
			return copyFile(precompiled, outputPath)
		}
		fmt.Printf("  Warning: sass not available, skipping %s: %v\n", inputPath, err)
		return nil
	}
	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
