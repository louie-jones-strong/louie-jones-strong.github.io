const path = require('path');
const fs = require('fs');
const PageBuilder = require('./PageBuilder.js');
const Compressor = require('./AssetCompressor.js');
const Utils = require('./Utils.js');
const ProjectConfigPostProcessor = require('./PostProcess_ProjectConfig.js');


class Main {
	constructor() {
		this.IsRelease = process.argv.includes("release");
		this.CleanBuild = process.argv.includes("clean");
		this.Compress = process.argv.includes("compress");
		this.OnlyCopyNew = process.argv.includes("onlyNew");

		if (this.IsRelease)
			this.CleanBuild = true;


		this.PathToRoot = path.join(__dirname, "..");

		let rootConfigPath = path.join(this.PathToRoot, "config");
		let sitePath = path.join(rootConfigPath, "Site.json");
		let projectPath = path.join(rootConfigPath, "Projects.json");
		let iconsPath = path.join(rootConfigPath, "Icons.json");

		this.SiteConfig = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
		this.ProjectConfig = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
		this.IconsConfig = JSON.parse(fs.readFileSync(iconsPath, 'utf8'));

		this.PostProcessConfig()

		console.log("=".repeat(20));
		console.log("Is Release: ", this.IsRelease);
		console.log("Clean Build: ", this.CleanBuild);
		console.log("Compression: ", this.Compress);
		console.log("Only Copy New: ", this.OnlyCopyNew);
		console.log("=".repeat(20));
		console.log();

		this.PageBuilder = new PageBuilder.PageBuilder(this.IsRelease, this.Compress, this.PathToRoot,
			this.SiteConfig, this.ProjectConfig, this.IconsConfig);

		this.Compressor = new Compressor.AssetCompressor(this.Compress, this.OnlyCopyNew, this.PathToRoot,
			this.SiteConfig, this.ProjectConfig, this.IconsConfig);
	}

	PostProcessConfig() {
		ProjectConfigPostProcessor.PostProcessProjectConfig(this.ProjectConfig);
	}

	BuildSite() {
		if (this.CleanBuild) {
			console.log();
			console.log("Cleaning Output Folder...");
			let outputPath = path.join(this.PathToRoot, this.SiteConfig.Output_ViewsFolder);
			fs.rmSync(outputPath, { recursive: true });
		}

		let outputPath = path.join(this.PathToRoot, this.SiteConfig.Output_ViewsFolder);
		Utils.TryMakeDir(outputPath)

		// build assets
		if (this.SiteConfig.Raw_StaticFolder.includes(this.SiteConfig.Raw_ViewsFolder)) {
			// console.log("Static Folder is a subfolder of Views Folder. Skipping Asset Build.");
		}
		else {
			console.log();
			console.log("Building Assets...");
			this.BuildAssets();
		}

		// build pages
		console.log();
		console.log("Building Pages...");
		this.BuildPages();

		// copy non ejs files in views folder
		console.log();
		console.log("Copying Non EJS Files...");
		this.CopyNonEJSFiles();
	}

	BuildAssets() {
		let sourcePath = path.join(this.PathToRoot, this.SiteConfig.Raw_StaticFolder);
		let outputPath = path.join(this.PathToRoot, this.SiteConfig.Output_StaticFolder);

		this.Compressor.HandleFolder(sourcePath, outputPath);
	}

	BuildPages() {

		// build project pages
		for (const projectKey of Object.keys(this.ProjectConfig)) {
			let pagePath = this.ProjectConfig[projectKey].PagePath;

			let config = { ProjectData: this.ProjectConfig[projectKey] }

			if (pagePath != null)
				this.PageBuilder.BuildPage(pagePath, config);
		}
	}

	CopyNonEJSFiles() {
		let sourcePath = path.join(this.PathToRoot, this.SiteConfig.Raw_ViewsFolder);
		let outputPath = path.join(this.PathToRoot, this.SiteConfig.Output_ViewsFolder);

		this.Compressor.HandleFolder(sourcePath, outputPath);
	}



}


main = new Main();
main.BuildSite();
