
const Path = require('path');
const Ejs = require('ejs');
const Fs = require('fs');

function RenderFile(templateFilePath, outputFilePath)
{
	console.log(templateFilePath, "->", outputFilePath);

	//render selected file
	Ejs.renderFile(templateFilePath, {PageData: PageData}, function(renderError, builtHtml) {

		// error handling
		if (renderError)
		{
			console.log(renderError);
			return;
		}

		// write rendered page to output path
		Fs.writeFile(outputFilePath, builtHtml, function (fileError) {

			// error handling
			if (fileError)
			{
				console.log(fileError);
				return;
			}
		});
	});
}

function ConvertAllTemplates()
{
	Fs.readdir(TemplatesFolder, function (error, files) {
		// error handling
		if (error)
		{
			console.log('Unable to scan directory: ' + error);
			return;
		}

		//iterate over all sub files
		files.forEach(function(fileName) {

			let templateFilePath = Path.join(TemplatesFolder, fileName);
			let stat = Fs.statSync(templateFilePath);

			// we can only render files not folders
			if (stat.isFile())
			{
				let outputFile = fileName;
				let lastDotIndex = outputFile.lastIndexOf(".");
				if (lastDotIndex >= 0)
				{
					outputFile = outputFile.slice(0, lastDotIndex);
				}
				outputFile += ".html";
				let outputFilePath = Path.join(OutputFolder, outputFile);

				RenderFile(templateFilePath, outputFilePath);
			}

		});
	});
}

const TemplatesFolder = "Views/"
const OutputFolder = "../"
let PageData = {
	IsDevMode:true
};

console.log("=".repeat(20));

if (process.argv.includes("Release"))
{
	PageData.IsDevMode = false;
	console.log("Building pages for Release");
}
console.log("PageData: ", PageData);

console.log("=".repeat(20));
console.log();



ConvertAllTemplates();