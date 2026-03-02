const assert = require("assert");


describe("CV Config", function () {

	var cvConfig = require("../config/CV.json");
	var projects = require("../config/Projects.json");

	it("CV Config Loaded", function () {
		assert.notEqual(cvConfig, null);
		assert.equal(typeof cvConfig, "object");
	});

	it("JobTitle", function () {
		let value = cvConfig.JobTitle;
		assert.notEqual(value, null);
		assert.equal(typeof value, "string");
		assert.ok(value.length >= 2);
	});

	it("ProfileKey", function () {
		let value = cvConfig.ProfileKey;
		assert.notEqual(value, null);
		assert.equal(typeof value, "string");
		assert.ok(value.length >= 2);
		assert.notEqual(projects[value], null, "ProfileKey must reference a valid project");
	});

	function CheckProjectList(listName) {
		it(listName, function () {
			let list = cvConfig[listName];
			assert.notEqual(list, null);
			assert.ok(Array.isArray(list));

			for (const key of list) {
				assert.notEqual(key, null);
				assert.equal(typeof key, "string");
				assert.ok(key.length >= 2);
				assert.notEqual(projects[key], null, key + " in " + listName + " must reference a valid project");
			}
		});
	}

	CheckProjectList("WorkProjects");
	CheckProjectList("EducationProjects");
	CheckProjectList("PersonalProjects");
});
