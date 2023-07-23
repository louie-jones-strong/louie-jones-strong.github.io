
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

const Compressor = require('./AssetCompressor.js');
const Utils = require('./Utils.js');

class PageBuilder
{
	constructor(isRelease, compress, pathToRoot)
	{
		this.IsRelease = isRelease;
		this.Compress = compress;
		this.PathToRoot = pathToRoot;


		let rootConfigPath = path.join(this.PathToRoot, "config");
		let sitePath = path.join(rootConfigPath, "Site.json");
		let projectPath = path.join(rootConfigPath, "Projects.json");
		let skillsPath = path.join(rootConfigPath, "Skills.json");

		this.SiteConfig = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
		this.ProjectConfig = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
		this.SkillConfig = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));

	}

	BuildPage(pagePath)
	{
		let sourcePath = path.join(this.PathToRoot, this.SiteConfig.Raw_ViewsFolder, pagePath);
		let outputPath = path.join(this.PathToRoot, this.SiteConfig.Output_ViewsFolder, pagePath);

		let sourceFilePath = sourcePath + ".ejs"
		let outputFilePath = outputPath + ".html"


		// check is file
		let stat = fs.statSync(sourceFilePath);
		if (!stat.isFile())
		{
			console.error("Cannot build folder: " + sourceFilePath);
			return;
		}

		Utils.TryMakeDir(path.dirname(outputFilePath));

		let pageName = path.basename(outputFilePath, ".html");
		let pageParent = path.dirname(pagePath);

		// count how many levels up the path is
		let count = pagePath.split(path.sep).length - 1;
		let pathToRoot = "../".repeat(count);


		let config = {
			SiteConfig: this.SiteConfig,
			Projects: this.ProjectConfig,
			Skills: this.SkillConfig,
			PageData: {
				IsRelease: this.IsRelease,
				PageName: pageName,
				PageParent: pageParent,
				PathToRoot: pathToRoot
			}
		}

		this.RenderFile(sourceFilePath, outputFilePath, config);
	}

	RenderFile(sourceFile, outputFile, config)
	{
		console.log(sourceFile, "->", outputFile);

		let compress = this.Compress;

		//render selected file
		ejs.renderFile(sourceFile, config,
			function(renderError, builtHtml) {

			// error handling
			if (renderError)
			{
				console.error(renderError);
				return;
			}


			if (compress)
				builtHtml = Compressor.CompressHtml(builtHtml);

			// write rendered page to output path
			fs.writeFile(outputFile, builtHtml, function (fileError) {

				// error handling
				if (fileError)
				{
					console.error(fileError);
					return;
				}
			});
		});
	}
}


exports.PageBuilder = PageBuilder;
