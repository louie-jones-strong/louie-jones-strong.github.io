const path = require('path');
const fs = require('fs');
const PageBuilder = require('./PageBuilder.js');
const Compressor = require('./AssetCompressor.js');



class Main
{
	constructor()
	{
		this.IsRelease = process.argv.includes("release");
		this.Compress = process.argv.includes("compress");
		this.PathToRoot = "../";

		let rootConfigPath = path.join(this.PathToRoot, "config");
		let sitePath = path.join(rootConfigPath, "Site.json");
		let projectPath = path.join(rootConfigPath, "Projects.json");
		let iconsPath = path.join(rootConfigPath, "Icons.json");

		this.SiteConfig = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
		this.ProjectConfig = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
		this.IconsConfig = JSON.parse(fs.readFileSync(iconsPath, 'utf8'));

		console.log("=".repeat(20));
		console.log("Is Release: ", this.IsRelease);
		console.log("Compression: ", this.Compress);
		console.log("=".repeat(20));
		console.log();
	}


	BuildSite()
	{
		// todo before adding this back need to make sure robots.txt is copied over and cv.pdf is copied over
		// if clean, delete output folder
		// if (this.IsRelease)
		// {
		// 	console.log();
		// 	console.log("Cleaning Output Folder...");
		// 	let outputPath = path.join(this.PathToRoot, this.SiteConfig.Output_ViewsFolder);
		// 	fs.rmSync(outputPath, {recursive: true});
		// }



		// build pages
		console.log();
		console.log("Building Pages...");
		this.BuildPages();

		// build assets
		console.log();
		console.log("Building Assets...");
		this.BuildAssets();
	}

	BuildPages()
	{
		let pageBuilder = new PageBuilder.PageBuilder(this.IsRelease, this.Compress, "../");

		// build project pages
		for (const projectKey of Object.keys(this.ProjectConfig))
		{
			let pagePath = this.ProjectConfig[projectKey].PagePath;

			let config = {ProjectData: this.ProjectConfig[projectKey]}

			if (pagePath != null)
				pageBuilder.BuildPage(pagePath, config);
		}
	}

	BuildAssets()
	{
		let compressor = new Compressor.AssetCompressor(this.Compress, "../");

		let sourcePath = path.join(this.PathToRoot, this.SiteConfig.Raw_StaticFolder);
		let outputPath = path.join(this.PathToRoot, this.SiteConfig.Output_StaticFolder);

		compressor.HandleFolder(sourcePath, outputPath);
	}



}


main = new Main();
main.BuildSite();
