const Path = require('path');
const Fs = require('fs');
const sharp = require('sharp');


function HandleFolder(path)
{

	Fs.readdir(path, function (error, items)
	{
		// error handling
		if (error)
		{
			console.log('Unable to scan directory: ' + error);
			return;
		}

		items.forEach(function(item)
		{

			let filePath = Path.join(path, item);
			let stat = Fs.statSync(filePath);


			if (stat.isFile())
			{
				let imageName = filePath;
				let lastDotIndex = imageName.lastIndexOf(".");
				if (lastDotIndex >= 0)
				{
					imageName = imageName.slice(0, lastDotIndex);
				}

				if (filePath.endsWith('.png') || (filePath.endsWith('.jpg') && !filePath.endsWith('_.jpg')))
				{
					console.log(filePath);


					for (let f = 0; f < ImageFormats.length; f++)
					{
						for (let s = 0; s < ImageSizes.length; s++)
						{
							let outputPath = imageName + "_" + ImageSizes[s] + "_" + ImageFormats[f];

							console.log("  ->  ", outputPath);

							sharp(filePath)
								.resize(ImageSizes[s])
								.toFile(outputPath, (error, info) =>
								{
									if (error)
									{
										console.log("Image Convert Error: " + error)
									}
								});
						}

						let outputPath = imageName + "_" + ImageFormats[f];
						console.log("  ->  ", outputPath);

						sharp(filePath)
							.toFile(outputPath, (error, info) =>
							{
								if (error)
								{
									console.log("Image Convert Error: " + error)
								}
							});
					}
				}
			}
			else
			{
				HandleFolder(filePath)
			}
		});
	});
}



const StartFolder = "../Public/Assets/"
const OutputFolder = "../Public/Assets/"
const ImageSizes = []
const ImageFormats = [".webp", ".jpg"]


HandleFolder(StartFolder);