const assert = require("assert");
const fs = require("fs");


describe("Skill Config", function ()
{

// load the skills config file
var skills = require("../config/Skills.json");

it("Skill Config Loaded", function () {
	assert.notEqual(skills, null);
	assert.equal(typeof skills, "object");
	assert.ok(Object.keys(skills).length > 0);
});



for (const skillKey in skills)
{
	describe("Key: " + skillKey, function ()
	{
		it("Skill Key", function () {
			assert.notEqual(skillKey, null);
			assert.equal(typeof skillKey, "string");
			assert.ok(skillKey.length >= 2);
		});


		var skill = skills[skillKey];

		it("Skill", function () {
			assert.notEqual(skill, null);
			assert.equal(typeof skill, "object");
		});

		it("Label", function () {
			let value = skill.Label;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 2);
		});

		it("IconPath", function () {
			let value = skill.IconPath;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 10);
		});

	});
}
});