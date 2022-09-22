const Path = require('path');
const Fs = require('fs');
const sharp = require('sharp');


function HandleFolder(inputPath, outputPath)
{
	TryMakeDir(outputPath)
	Fs.readdir(inputPath, function (error, items)
	{
		// error handling
		if (error)
		{
			console.log('Unable to scan directory: ' + error);
			return;
		}

		items.forEach(function(item)
		{

			let itemInputPath = Path.join(inputPath, item);
			let itemOutputPath = Path.join(outputPath, item);


			let stat = Fs.statSync(itemInputPath);
			if (stat.isFile())
			{
				if (itemInputPath.endsWith('.png') || itemInputPath.endsWith('.jpg'))
				{
					CompressImages(itemInputPath, itemOutputPath)
				}
				else if (Compress && itemInputPath.endsWith('.js'))
				{
					TextFiles(itemInputPath, itemOutputPath, function(data)
					{
						// remove comments
						data = data.replace(/((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/g,'');

						// remove new lines
						data = data.replace(/[\r\n]/gm, ' ');

						// remove tabs
						data = data.replace(/\t/g,'');

						return data;
					});
				}
				else if (Compress && itemInputPath.endsWith('.css'))
				{
					TextFiles(itemInputPath, itemOutputPath, function(data)
					{
						// remove comments
						data = data.replace(/\/\*.+?\*\//g,'');

						// remove new lines
						data = data.replace(/[\r\n]/g, '');

						// remove tabs
						data = data.replace(/\t/g,'');

						// remove spaces
						data = data.replace(' ','');
						return data;
					});
				}
				else
				{
					Fs.copyFile(itemInputPath, itemOutputPath, (err) => {
						if (error)
						{
							console.log("File copy error: " + error)
						}
						else
						{
							console.log(itemInputPath + " -> ", itemOutputPath);
						}
					});
				}
			}
			else
			{
				HandleFolder(itemInputPath, itemOutputPath)
			}
		});
	});
}

function RemoveExtension(path)
{
	let filePath = path;
	let lastDotIndex = path.lastIndexOf(".");
	if (lastDotIndex >= 0)
	{
		filePath = path.slice(0, lastDotIndex);
	}
	return filePath
}

function TextFiles(inputPath, outputPath, compressorFunc)
{
	Fs.readFile(inputPath, 'utf8', function(fileError, data)
	{
		if (fileError)
		{
			console.log("Read File: " + fileError);
			return;
		}

		data = compressorFunc(data)

		Fs.writeFile(outputPath, data, function (fileError)
		{

			// error handling
			if (fileError)
			{
				console.log("Write File: " + fileError);
				return;
			}

			console.log(inputPath + " -> ", outputPath);
		});
	});
}

function TryMakeDir(path)
{
	try {
		Fs.mkdirSync(path)
	} catch (err) {
		if (err.code !== 'EEXIST') throw err
	}
}

function CompressImages(inputPath, outputPath)
{
	let noExtensionPath = RemoveExtension(outputPath)

	console.log(inputPath);
	for (let f = 0; f < ImageFormats.length; f++)
	{
		for (let s = 0; s < ImageSizes.length; s++)
		{
			let outputPath = noExtensionPath + "_" + ImageSizes[s] + ImageFormats[f];

			console.log("  ->  ", outputPath);

			sharp(inputPath)
				.resize(ImageSizes[s])
				.toFile(outputPath, (error, info) =>
				{
					if (error)
					{
						console.log("Image Convert Error: " + error)
					}
				});
		}

		let outputPath = noExtensionPath + ImageFormats[f];
		console.log("  ->  ", outputPath);

		sharp(inputPath)
			.toFile(outputPath, (error, info) =>
			{
				if (error)
				{
					console.log("Image Convert Error: " + error)
				}
			});
	}
}


const StartFolder = "../Public_Raw/"
const OutputFolder = "../Public/"

const ImageSizes = []
const ImageFormats = [".webp", ".png"]

Compress = true;

if (process.argv.includes("NoCompress"))
{
	Compress = false;
}

console.log("=".repeat(20));

console.log("Compress: ", Compress);

console.log("=".repeat(20));

HandleFolder(StartFolder, OutputFolder);