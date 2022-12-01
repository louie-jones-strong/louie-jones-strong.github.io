const Path = require('path');
const Fs = require('fs');
const Sharp = require('sharp');
const Sass = require('sass');


function HandleFolder(inputPath, outputPath)
{
	if (FoldersToSkip.includes(inputPath))
	{
		console.log("Skip folder: " + inputPath)
		return;
	}
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
				HandleFile(itemInputPath, itemOutputPath)
			}
			else
			{
				HandleFolder(itemInputPath, itemOutputPath)
			}
		});
	});
}

function HandleFile(itemInputPath, itemOutputPath)
{
	if (itemInputPath.endsWith('.png') || itemInputPath.endsWith('.jpg')) // Images
	{
		CompressImages(itemInputPath, itemOutputPath)
	}
	else if (Compress && itemInputPath.endsWith('.js')) // JS
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
	else if (Compress && itemInputPath.endsWith('.css')) // CSS
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
	else if (itemInputPath.endsWith('.scss')) // scss
	{
		// let tempCssOutput = RemoveExtension(itemInputPath)
		// tempCssOutput += ".css"

		itemOutputPath = RemoveExtension(itemOutputPath)
		itemOutputPath += ".css"

		// if(!ShouldSkipFile(itemOutputPath))
		{

			let result = Sass.compile(itemInputPath);
			Fs.writeFile(itemOutputPath, result.css, function (fileError)
			{

				// error handling
				if (fileError)
				{
					console.log("Write File: " + fileError);
					return;
				}
				// console.log(itemInputPath + " -> ", itemOutputPath);

				if (Compress)
				{
					HandleFile(itemOutputPath, itemOutputPath)
				}
			});
		}

	}
	else // others just copy
	{
		if(!ShouldSkipFile(itemOutputPath))
		{

			Fs.copyFile(itemInputPath, itemOutputPath, (error) => {
				if (error)
				{
					console.log("File copy error: " + error)
				}
				else
				{
					// console.log(itemInputPath + " -> ", itemOutputPath);
				}
			});

		}
	}
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
	if(ShouldSkipFile(outputPath))
	{
		return;
	}

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

			// console.log(inputPath + " -> ", outputPath);
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

	Sharp(inputPath)
		.metadata()
		.then(function(metadata)
	{

		// console.log(inputPath + " " + metadata.width);

		for (let f = 0; f < ImageFormats.length; f++)
		{

			width = metadata.width

			outputRezIndex = ImageSizes.length - 1
			while (width < ImageSizes[outputRezIndex])
			{
				let outputPath = noExtensionPath + "_" + ImageSizes[outputRezIndex] + ImageFormats[f];

				if(!ShouldSkipFile(outputPath))
				{
					// console.log("  ->  ", outputPath);

					Sharp(inputPath)
						.toFile(outputPath, (error, info) =>
					{
						if (error)
						{
							console.log("Image Convert Error: " + error)
						}
					});
				}

				outputRezIndex -= 1;
			}


			newWidth = width;
			while (outputRezIndex >= 0)
			{
				if (newWidth < ImageSizes[outputRezIndex])
				{
					outputPath = noExtensionPath + "_" + ImageSizes[outputRezIndex] + ImageFormats[f];

					if(!ShouldSkipFile(outputPath))
					{
						// console.log("  ->  ", outputPath);
						Sharp(inputPath)
							.resize(width)
							.toFile(outputPath, (error, info) =>
						{
							if (error)
							{
								console.log("Image Convert Error: " + error)
							}
						});

					}
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


function ShouldSkipFile(path)
{
	return Fs.existsSync(path) && OnlyCopyIfNew;
}

const StartFolder = "../Public_Raw/"
const OutputFolder = "../Public/"

const FoldersToSkip = [Path.join(StartFolder, "css", "Shared")]



const ImageSizes = [128, 256,512,1024,2048]
const ImageFormats = [".webp", ".png"]

Compress = true;
CleanCopy = false;
OnlyCopyIfNew = false;

if (process.argv.includes("NoCompress"))
{
	Compress = false;
}

if (process.argv.includes("CleanCopy"))
{
	CleanCopy = true;
}

if (process.argv.includes("OnlyCopyIfNew"))
{
	OnlyCopyIfNew = true;
}

console.log("=".repeat(20));

console.log("Compress: ", Compress);
console.log("CleanCopy: ", CleanCopy);
console.log("OnlyCopyIfNew: ", OnlyCopyIfNew);

console.log("=".repeat(20));

if (CleanCopy)
{
	Fs.rmSync(OutputFolder, { recursive: true, force: true });
}

HandleFolder(StartFolder, OutputFolder);