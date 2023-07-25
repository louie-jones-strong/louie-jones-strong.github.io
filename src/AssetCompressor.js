const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const sass = require('sass');
const Utils = require('./Utils.js');


class AssetCompressor
{
	constructor(compress, pathToRoot)
	{
		this.Compress = compress;
		this.PathToRoot = pathToRoot;

		let rootConfigPath = path.join(this.PathToRoot, "config");
		let sitePath = path.join(rootConfigPath, "Site.json");
		this.SiteConfig = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
	}


	HandleFolder(inputPath, outputPath)
	{
		if (this.IsFolderToSkip(inputPath))
		{
			console.log("Skip folder: " + inputPath)
			return;
		}

		Utils.TryMakeDir(outputPath)
		let self = this;

		fs.readdir(inputPath, function (error, items)
		{
			// error handling
			if (error)
			{
				console.log('Unable to scan directory: ' + error);
				return;
			}
			for (let i = 0; i < items.length; i++)
			{
				let item = items[i];

				let itemInputPath = path.join(inputPath, item);
				let itemOutputPath = path.join(outputPath, item);


				let stat = fs.statSync(itemInputPath);
				if (stat.isFile())
				{
					self.HandleFile(itemInputPath, itemOutputPath)
				}
				else
				{
					self.HandleFolder(itemInputPath, itemOutputPath)
				}
			}
		});
	}

	IsFolderToSkip(folderPath)
	{
		let pathStart = path.join(this.PathToRoot, this.SiteConfig.Raw_StaticFolder);
		pathStart += path.sep
		let removedFront = folderPath.replace(pathStart, "");

		removedFront = removedFront.replace(path.sep, "/")

		let noCopyFolders = this.SiteConfig.AssetConfig.NoCopyFolders;

		return noCopyFolders.includes(removedFront)
	}

	HandleFile(itemInputPath, itemOutputPath)
	{
		if (itemInputPath.endsWith('.png') || itemInputPath.endsWith('.jpg')) // Images
		{
			this.CompressImage(itemInputPath, itemOutputPath)
		}
		else if (this.Compress && itemInputPath.endsWith('.js')) // JS
		{
			this.TextFiles(itemInputPath, itemOutputPath, CompressJs);
		}
		else if (this.Compress && itemInputPath.endsWith('.css')) // CSS
		{
			this.TextFiles(itemInputPath, itemOutputPath, CompressCss);
		}
		else if (itemInputPath.endsWith('.scss')) // scss
		{
			itemOutputPath = Utils.RemoveExtension(itemOutputPath)
			itemOutputPath += ".css"


			let self = this;
			let result = sass.compile(itemInputPath);
			fs.writeFile(itemOutputPath, result.css, function (fileError)
			{

				// error handling
				if (fileError)
				{
					console.log("Write File: " + fileError);
					return;
				}

				if (self.Compress)
				{
					self.TextFiles(itemOutputPath, itemOutputPath, CompressCss);
				}
			});

		}
		else // others just copy
		{
			fs.copyFile(itemInputPath, itemOutputPath, (error) => {
				if (error)
				{
					console.log("File copy error: " + error)
				}
			});
		}
	}

	TextFiles(inputPath, outputPath, compressorFunc)
	{
		fs.readFile(inputPath, 'utf8', function(fileError, data)
		{
			if (fileError)
			{
				console.log("Read File: " + fileError);
				return;
			}

			data = compressorFunc(data)

			fs.writeFile(outputPath, data, function (fileError)
			{

				// error handling
				if (fileError)
				{
					console.log("Write File: " + fileError);
					return;
				}
			});
		});
	}

	CompressImage(inputPath, outputPath)
	{
		let noExtensionPath = Utils.RemoveExtension(outputPath)

		let imageConfig = this.SiteConfig.AssetConfig.ImageConfig;
		let imageFormats = imageConfig.ImageFormats_Outputs;
		let imageSizes = imageConfig.ImageSizes;

		sharp(inputPath)
			.metadata()
			.then(function(metadata)
		{

			for (let f = 0; f < imageFormats.length; f++)
			{

				let width = metadata.width

				let outputRezIndex = imageSizes.length - 1
				while (width < imageSizes[outputRezIndex])
				{
					let outputPath = noExtensionPath + "_" + imageSizes[outputRezIndex] + imageFormats[f];

					sharp(inputPath)
						.toFile(outputPath, (error, info) =>
					{
						if (error)
						{
							console.error("Image Convert Error: " + error)
						}
					});

					outputRezIndex -= 1;
				}


				let newWidth = width;
				while (outputRezIndex >= 0)
				{
					if (newWidth < imageSizes[outputRezIndex])
					{
						outputPath = noExtensionPath + "_" + imageSizes[outputRezIndex] + imageFormats[f];

						sharp(inputPath)
							.resize(width)
							.toFile(outputPath, (error, info) =>
						{
							if (error)
							{
								console.error("Image Convert Error: " + error)
							}
						});
						width = newWidth;
						outputRezIndex -= 1;
					}
					else
					{
						width = newWidth;
						newWidth = Math.round(newWidth * 0.5);
					}
				}
			}
		});
	}

}


function CompressHtml(text)
{
	// remove comments
	text = text.replace(/<!--(.*?)-->/g,'');

	// remove new lines but keep spaces when there is a . or ,
	text = text.replace(/[.][\r\n]/gm, '. ');
	text = text.replace(/[,][\r\n]/gm, ', ');

	// remove new lines
	text = text.replace(/[\r\n]/gm, '');

	// remove tabs
	text = text.replace(/\t/g,'');
	return text
}

function CompressCss(text)
{
	// remove comments
	text = text.replace(/\/\*.+?\*\//g,'');

	// remove new lines
	text = text.replace(/[\r\n]/g, '');

	// remove tabs
	text = text.replace(/\t/g,'');

	// remove spaces
	text = text.replace(' ','');
	return text;
}

function CompressJs(text)
{
	// remove comments
	text = text.replace(/((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g,'');

	// remove new lines
	text = text.replace(/[\r\n]/gm, ' ');

	// remove tabs
	text = text.replace(/\t/g,'');

	return text;
}

exports.AssetCompressor = AssetCompressor;
exports.CompressHtml = CompressHtml;