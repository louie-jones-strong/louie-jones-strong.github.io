
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

const Compressor = require('./AssetCompressor.js');
const Utils = require('./Utils.js');

class PageBuilder
{
	constructor(isRelease, compress, pathToRoot, siteConfig, projectConfig, iconsConfig)
	{
		this.IsRelease = isRelease;
		this.Compress = compress;
		this.PathToRoot = pathToRoot;

		this.SiteConfig = siteConfig;
		this.ProjectConfig = projectConfig;
		this.IconsConfig = iconsConfig;

	}

	BuildPage(pagePath, config)
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
		let count = pagePath.split("/").length - 1;
		let pathToRoot = "../".repeat(count);


		config["PageData"] = {
			IsRelease: this.IsRelease,
			PageName: pageName,
			PageParent: pageParent,
			PathToRoot: pathToRoot,
			SiteConfig: this.SiteConfig,
			Projects: this.ProjectConfig,
			Icons: this.IconsConfig,
		}

		this.RenderFile(sourceFilePath, outputFilePath, config);
	}

	RenderFile(sourceFile, outputFile, config)
	{
		console.log(Utils.MakePathRelative(sourceFile), "->", Utils.MakePathRelative(outputFile));

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
