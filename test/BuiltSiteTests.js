const path = require('path');
const assert = require("assert");
const fs = require("fs");
const utils = require("../src/Utils.js");



describe("BuiltTests", function ()
{
	var siteConfig = require("../config/Site.json");
	var projects = require("../config/Projects.json");
	var outDir = siteConfig.Output_ViewsFolder

	it("siteConfig Config Loaded", function () {
		assert.notEqual(siteConfig, null);
	});

	it("Project Config Loaded", function () {
		assert.notEqual(projects, null);
	});

	it("Check CV Download", function ()
	{
		if (siteConfig.ContactLinks.CVDownloadAllowed)
		{
			assert.ok(fs.existsSync(outDir + "/CV.pdf"));
		}
		else
		{
			assert.ok(!fs.existsSync(outDir + "/CV.pdf"));
		}
	});


	describe("Check project pages", function ()
	{
		assert.ok(projects);
		for (const projectKey in projects)
		{
			var project = projects[projectKey];
			if (project.PagePath != null)
			{
				let pagePath = path.join(outDir, project.PagePath+".html");
				CheckPage(pagePath);
			}
		}
	});



	function CheckPage(pagePath)
	{
	describe("Check page: " + pagePath, function ()
	{
		it("Exists", function ()
		{
			let exists = fs.existsSync(pagePath);
			let message = "Page does not exist: " + pagePath;
			assert.ok(exists, message);
		});

		let page = fs.readFileSync(pagePath, "utf8");

		assert.notEqual(page, null);

		it("href", function ()
		{
			let srcs = FindOccurrances(page, /href="([^"]*)"/g);
			for (const src of srcs)
			{
				let srcPath = src.replace("href=\"", "").replace("\"", "");
				CheckLocalPath(pagePath, srcPath);
			}
		});

		it("src", function ()
		{
			let srcs = FindOccurrances(page, /src="([^"]*)"/g);
			for (const src of srcs)
			{
				let srcPath = src.replace("src=\"", "").replace("\"", "");
				CheckLocalPath(pagePath, srcPath);
			}
		});

		// it("srcset", function ()
		// {

		// });



		// it("alt", function ()
		// {

		// });

		// it("text", function ()
		// {

		// });

	});
	}

	function FindOccurrances(content, regex)
	{
		let matches = content.match(regex);
		return matches;
	}

	function CheckLocalPath(pagePath, localPath)
	{
		if (localPath.startsWith("http"))
		{
			// todo check that the url exists

		}
		else if (localPath.startsWith("mailto"))
		{
			// todo check that the url exists

		}
		else if (localPath.startsWith("#"))
		{
			// todo check that the section exists

		}
		else
		{
			let localFile = path.join(pagePath, "../"+localPath);
			let srcExists = fs.existsSync(localFile);
			let message = "doesn't exist: " + localFile;
			assert.ok(srcExists, message);
		}



	}


});