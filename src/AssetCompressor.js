const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const sass = require('sass');
const Utils = require('./Utils.js');
const ffmpegCommand = require('fluent-ffmpeg');



class AssetCompressor {
	constructor(compress, onlyCopyNew, pathToRoot, siteConfig, projectConfig, iconsConfig) {
		this.Compress = compress;
		this.OnlyCopyNew = onlyCopyNew;
		this.PathToRoot = pathToRoot;

		this.SiteConfig = siteConfig;
		this.ProjectConfig = projectConfig;
		this.IconsConfig = iconsConfig;
	}


	HandleFolder(inputPath, outputPath) {
		if (this.IsFolderToSkip(inputPath)) {
			console.log("Skip folder: " + inputPath)
			return;
		}

		Utils.TryMakeDir(outputPath)
		let self = this;

		fs.readdir(inputPath, function (error, items) {
			// error handling
			if (error) {
				console.log('Unable to scan directory: ' + error);
				return;
			}

			for (let i = 0; i < items.length; i++) {
				let item = items[i];

				let itemInputPath = path.join(inputPath, item);
				let itemOutputPath = path.join(outputPath, item);


				let stat = fs.statSync(itemInputPath);
				if (stat.isFile()) {
					self.HandleFile(itemInputPath, itemOutputPath)
				}
				else {
					self.HandleFolder(itemInputPath, itemOutputPath)
				}
			}
		});
	}

	IsFolderToSkip(folderPath) {
		let pathStart = path.join(this.PathToRoot, this.SiteConfig.Raw_StaticFolder);
		pathStart += path.sep
		let removedFront = folderPath.replace(pathStart, "");

		removedFront = removedFront.replace(path.sep, "/")

		let noCopyFolders = this.SiteConfig.AssetConfig.NoCopyFolders;

		return noCopyFolders.includes(removedFront)
	}

	HandleFile(itemInputPath, itemOutputPath) {
		if (itemInputPath.endsWith('.png') || itemInputPath.endsWith('.jpg')) // Images
		{
			this.CompressImage(itemInputPath, itemOutputPath)
		}
		else if (itemInputPath.endsWith('.mp4')) // Videos
		{
			this.CompressVideo(itemInputPath, itemOutputPath)
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

			// if (fs.existsSync(itemOutputPath) && this.OnlyCopyNew)
			// {
			// 	return;
			// }

			let self = this;
			let result = sass.compile(itemInputPath);
			fs.writeFile(itemOutputPath, result.css, function (fileError) {

				// error handling
				if (fileError) {
					console.log("Write File: " + fileError);
					return;
				}

				if (self.Compress) {
					self.TextFiles(itemOutputPath, itemOutputPath, CompressCss);
				}
			});

		}
		else if (itemInputPath.endsWith('.ejs') | itemInputPath.endsWith('.html')) {
			// skip these files

		}
		else // others just copy
		{
			this.CopyFile(itemInputPath, itemOutputPath)
		}
	}

	TextFiles(inputPath, outputPath, compressorFunc) {
		// if (fs.existsSync(outputPath) && this.OnlyCopyNew)
		// {
		// 	return;
		// }

		fs.readFile(inputPath, 'utf8', function (fileError, data) {
			if (fileError) {
				console.log("Read File: " + fileError);
				return;
			}

			data = compressorFunc(data)

			fs.writeFile(outputPath, data, function (fileError) {

				// error handling
				if (fileError) {
					console.log("Write File: " + fileError);
					return;
				}
			});
		});
	}

	CompressImage(inputPath, outputPath) {
		let noExtensionPath = Utils.RemoveExtension(outputPath)

		let imageConfig = this.SiteConfig.AssetConfig.ImageConfig;
		let imageFormats = imageConfig.OutputFormats;
		let horizontalResGroups = imageConfig.HorizontalResolutionsGroups;

		let outputFilePath = noExtensionPath + "_" + horizontalResGroups[0] + "." + imageFormats[0];

		if (fs.existsSync(outputFilePath) && this.OnlyCopyNew) {
			return;
		}


		sharp(inputPath)
			.metadata()
			.then(function (metadata) {

				for (let f = 0; f < imageFormats.length; f++) {

					let width = metadata.width

					let outputRezIndex = horizontalResGroups.length - 1
					while (width < horizontalResGroups[outputRezIndex]) {
						let outputPath = noExtensionPath + "_" + horizontalResGroups[outputRezIndex] + "." + imageFormats[f];

						sharp(inputPath)
							.toFile(outputPath, (error, info) => {
								if (error) {
									console.error("Image Convert Error: " + error)
								}
							});

						outputRezIndex -= 1;
					}


					let newWidth = width;
					while (outputRezIndex >= 0) {
						if (newWidth < horizontalResGroups[outputRezIndex]) {
							outputPath = noExtensionPath + "_" + horizontalResGroups[outputRezIndex] + "." + imageFormats[f];

							sharp(inputPath)
								.resize(width)
								.toFile(outputPath, (error, info) => {
									if (error) {
										console.error("Image Convert Error: " + error)
									}
								});
							width = newWidth;
							outputRezIndex -= 1;
						}
						else {
							width = newWidth;
							newWidth = Math.round(newWidth * 0.5);
						}
					}
				}
			});
	}

	CompressVideo(inputPath, outputPath) {
		this.CopyFile(inputPath, outputPath)

		// todo add this back
		// this was removed because converting the videos was taking to many resources on the github actions jobs
		// there is a limit of 7gb per job and this was using 15gb when ran locally

		// let noExtensionPath = Utils.RemoveExtension(outputPath)

		// let videoConfig = this.SiteConfig.AssetConfig.VideoConfig;
		// let outputFormats = videoConfig.OutputFormats;
		// let horizontalResGroups = videoConfig.HorizontalResolutionsGroups;

		// let outputFilePath = noExtensionPath + "_" + horizontalResGroups[0] + "." + outputFormats[0];

		// if (fs.existsSync(outputFilePath) && this.OnlyCopyNew)
		// {
		// 	return;
		// }

		// for (let r = 0; r < horizontalResGroups.length; r++)
		// {
		// 	for (let f = 0; f < outputFormats.length; f++)
		// 	{
		// 		let outputFilePath = noExtensionPath + "_" + horizontalResGroups[r] + "." + outputFormats[f];

		// 		let ffmpeg = ffmpegCommand(inputPath);
		// 		ffmpeg.addOption('-threads', 2);

		// 		ffmpeg.withAudioChannels(1);
		// 		ffmpeg.audioBitrate('128k');

		// 		ffmpeg.videoCodec('libx264');
		// 		ffmpeg.addOption('-x264opts', 'keyint=24:min-keyint=24:no-scenecut')
		// 		ffmpeg.videoBitrate('4000k');

		// 		ffmpeg.output(outputFilePath);
		// 		ffmpeg.on('error', function(error)
		// 		{
		// 			console.log("Error "+error.message+" converting video: " + inputPath + " to " + outputFormats[f]);
		// 		});
		// 		ffmpeg.run();
		// 	}
		// }
	}

	CopyFile(inputPath, outputPath) {
		fs.copyFile(inputPath, outputPath, (error) => {
			if (error) {
				console.log("File copy error: " + error)
			}
		});
	}
}


function CompressHtml(text) {
	// remove comments
	text = text.replace(/<!--([\s\S]*?)-->/g, '');

	// remove new lines but keep spaces when there is a . or ,
	text = text.replace(/[.][\r\n]/gm, '. ');
	text = text.replace(/[,][\r\n]/gm, ', ');

	// remove new lines
	text = text.replace(/[\r\n]/gm, '');

	// remove tabs
	text = text.replace(/\t/g, '');
	return text
}

function CompressCss(text) {
	// remove comments
	text = text.replace(/\/\*.+?\*\//g, '');

	// remove new lines
	text = text.replace(/[\r\n]/g, '');

	// remove tabs
	text = text.replace(/\t/g, '');

	// remove spaces
	text = text.replace(' ', '');
	return text;
}

function CompressJs(text) {
	// remove comments
	text = text.replace(/((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g, '');

	// remove new lines
	text = text.replace(/[\r\n]/gm, ' ');

	// remove tabs
	text = text.replace(/\t/g, '');

	return text;
}

exports.AssetCompressor = AssetCompressor;
exports.CompressHtml = CompressHtml;