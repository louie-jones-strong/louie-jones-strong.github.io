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

		describe("Links: " + pagePath, function ()
		{
			it("href", function ()
			{
				let srcs = FindOccurrences(page, /href="([^"]*)"/g);
				for (const src of srcs)
				{
					let srcPath = src.replace("href=\"", "").replace("\"", "");
					CheckLocalPath(pagePath, srcPath);
				}
			});

			it("src", function ()
			{
				let srcs = FindOccurrences(page, /src="([^"]*)"/g);
				for (const src of srcs)
				{
					let srcPath = src.replace("src=\"", "").replace("\"", "");
					CheckLocalPath(pagePath, srcPath);
				}
			});

			it("srcset", function ()
			{
				let srcsets = FindOccurrences(page, /srcset="([^"]*)"/g);
				for (const srcset of srcsets)
				{
					let srcs = srcset.replace("srcset=\"", "").replace("\"", "").split(",");
					for (const src of srcs)
					{
						let srcPath = src.trim().split(" ")[0];
						CheckLocalPath(pagePath, srcPath);
					}
				}

			});
		});


		describe("Text: " + pagePath, function ()
		{
			it("alt", function ()
			{
				let items = FindOccurrences(page, /alt="([^"]*)"/g);
				for (const item of items)
				{
					let alt = item.replace("alt=\"", "").replace("\"", "");
					CheckText(alt, "alt", 5, true, false);

				}
			});


			describe("Text Tags: " + pagePath, function ()
			{
				let textTypes = [
					["h1", 5, false, false],
					["h2", 4, false, false],
					["h3", 3, false, false],
					["h4", 4, false, false],
					["h5", 1, false, false],
					["h6", 4, false, false],
					["p", 4, true, true],
					["a", 4, false, false]];


				for (const kvp of textTypes)
				{
					let textType = kvp[0];
					let minLen = kvp[1];
					let oneWord = kvp[2];
					let punctuation = kvp[3];

					it(textType, function ()
					{
						let items = FindOccurrences(page, new RegExp("<" + textType + "[^>]*>[^<]*</" + textType + ">", "g"));
						if (items != null)
						{
							for (const item of items)
							{
								// get only the inner text
								let text = item.replace(new RegExp("<" + textType + "[^>]*>", "g"), "").replace(new RegExp("</" + textType + ">", "g"), "");
								context = "(" + textType + ") " + item;
								CheckText(text, context, minLen, oneWord=oneWord, punctuation=punctuation);
							}
						}
					});
				}
			});
		});

		describe("Images: " + pagePath, function ()
		{
			it("Must have alt", function ()
			{
				let items = FindOccurrences(page, /<img[^>]*>/g);
				for (const item of items)
				{
					let alt = item.match(/alt="([^"]*)"/g);
					let message = "Missing alt: " + item;
					assert.ok(alt, message);
				}
			});
		});

	});
	}

	function FindOccurrences(content, regex)
	{
		let matches = content.match(regex);
		return matches;
	}

	function CheckLocalPath(pagePath, localPath)
	{
		if (localPath.startsWith("http"))
		{
			// todo check that the url exists
			// check that the url is valid
			let validRegex = /https?:\/\/[^\s$.?#].[^\s]*$/gm;
			let valid = validRegex.test(localPath);
			let message = "Invalid url: " + localPath;
			assert.ok(valid, message);

		}
		else if (localPath.startsWith("mailto"))
		{
			// check that the email is valid
			let email = localPath.replace("mailto:", "");
			let validRegex = /\S+@\S+\.\S+/;
			let valid = validRegex.test(email);
			let message = "Invalid email: " + email;
			assert.ok(valid, message);
		}
		else if (localPath.startsWith("#"))
		{
			// todo check that the section exists

		}
		else
		{
			let localFile = localPath;

			if (localPath.startsWith("../"))
				localFile = path.join(pagePath, "../"+localPath);
			else
				localFile = path.join(outDir, localPath);


			let srcExists = fs.existsSync(localFile);
			let message = "doesn't exist: " + localFile;
			assert.ok(srcExists, message);
		}
	}

	function CheckText(text, message, minLen, oneWord=true, punctuation=true)
	{
		message = "\"" + text + "\" Context: " + message
		assert.ok(text, "text missing: " + message);
		assert.ok(text.length >= minLen, "text to short: " + message);
		assert.ok(!text.includes("  "), "double space: " + message);

		if (oneWord)
			assert.ok(text.includes(" "), "Only one word: " + message);

		if (punctuation)
		{
			let validPunctuation =
				text.endsWith(".") ||
				text.endsWith(". ") ||
				text.endsWith("?") ||
				text.endsWith("? ") ||
				text.endsWith("!") ||
				text.endsWith("! ") ||
				text.endsWith(":") ||
				text.endsWith(": ");


			assert.ok(validPunctuation, "Missing full stop: " + message);
		}

		// check for any lowercase i's
		assert.ok(!text.match(/i /g), "found lowercase i: " + message);



		// todo check for bad words
		let lowerText = text.toLowerCase();
		let badWords = new Set(["fuck", "shit"]);

	}
});