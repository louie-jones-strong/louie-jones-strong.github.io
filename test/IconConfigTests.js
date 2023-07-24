const assert = require("assert");
const fs = require("fs");


describe("Icon Config", function ()
{

// load the icons config file
var icons = require("../config/Icons.json");

it("Icon Config Loaded", function () {
	assert.notEqual(icons, null);
	assert.equal(typeof icons, "object");
	assert.ok(Object.keys(icons).length > 0);
});



for (const iconKey in icons)
{
	describe("Key: " + iconKey, function ()
	{
		it("Icon Key", function () {
			assert.notEqual(iconKey, null);
			assert.equal(typeof iconKey, "string");
			assert.ok(iconKey.length >= 2);
		});


		var icon = icons[iconKey];

		it("Icon", function () {
			assert.notEqual(icon, null);
			assert.equal(typeof icon, "object");
		});

		it("Label", function () {
			let value = icon.Label;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 2);
		});

		it("IconPath", function () {
			let value = icon.IconPath;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 10);
		});

		it("ClassList", function () {
			let value = icon.ClassList;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
		});

	});
}
});