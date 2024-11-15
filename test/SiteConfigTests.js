const assert = require("assert");
const fs = require("fs");


describe("Site Config", function () {

	// load the site config file
	var siteConfig = require("../config/Site.json");

	it("Site Config Loaded", function () {
		assert.notEqual(siteConfig, null);
		assert.equal(typeof siteConfig, "object");
		assert.ok(Object.keys(siteConfig).length > 0);
	});

	describe("HostURL", function () {
		CheckLink("HostURL", siteConfig);
	});

	describe("ContactLinks", function () {
		var contactLinks = siteConfig.ContactLinks;

		describe("Links", function () {
			CheckLink("LinkedIn", contactLinks);
			CheckLink("GitHub", contactLinks);
			CheckLink("ItchIo", contactLinks);
			CheckLink("Instagram", contactLinks);
			CheckLink("Twitter", contactLinks);
			CheckLink("LeetCode", contactLinks);
			CheckLink("Kaggle", contactLinks);
		});

		it("CVDownloadAllowed", function () {
			let value = contactLinks.CVDownloadAllowed;
			assert.notEqual(value, null);
			assert.equal(typeof value, "boolean");
		});
		it("Email", function () {
			let value = contactLinks.Email;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
		});
	});

	function CheckLink(linkKey, parentConfig) {
		it("link: " + linkKey, function () {

			assert.ok(parentConfig.hasOwnProperty(linkKey));

			let link = parentConfig[linkKey];

			if (link !== null) {
				assert.equal(typeof link, "string");
				assert.ok(link.length > 0);
			}
		});
	}


});