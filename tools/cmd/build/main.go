package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"runtime"

	"sitebuilder/pkg/builder"
)

func main() {
	var release = flag.Bool("release", false, "Production build")
	var clean = flag.Bool("clean", false, "Delete output folder before build")
	var compress = flag.Bool("compress", false, "Enable compression")
	var onlyNew = flag.Bool("only-new", false, "Only copy new files")
	flag.Parse()

	if *release {
		*clean = true
	}

	fmt.Println("====================")
	fmt.Printf("Is Release: %v\n", *release)
	fmt.Printf("Clean Build: %v\n", *clean)
	fmt.Printf("Compression: %v\n", *compress)
	fmt.Printf("Only Copy New: %v\n", *onlyNew)
	fmt.Println("====================")

	// Find repo root (go up from tools/cmd/build/)
	_, filename, _, _ := runtime.Caller(0)
	repoRoot := filepath.Join(filepath.Dir(filename), "..", "..", "..")
	repoRoot, _ = filepath.Abs(repoRoot)

	b, err := builder.NewBuilder(*release, *clean, *compress, *onlyNew, repoRoot)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	if err := b.Build(); err != nil {
		fmt.Fprintf(os.Stderr, "Build error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("\nBuild complete!")
}
