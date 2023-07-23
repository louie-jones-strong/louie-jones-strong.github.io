const assert = require("assert");
const fs = require("fs");


describe("Projects Config", function ()
{


// load the skills config file
var skillsConfig = require("../config/Skills.json");
it("Skills Config Loaded", function () {
	assert.notEqual(skillsConfig, null);
	assert.equal(typeof skillsConfig, "object");
	assert.ok(Object.keys(skillsConfig).length > 0);
});


// load the projects config file
var projects = require("../config/Projects.json");
it("Project Config Loaded", function () {
	assert.notEqual(projects, null);
});



for (const projectKey in projects)
{
	describe("Key: " + projectKey, function ()
	{
		it("Project Key", function () {
			assert.notEqual(projectKey, null);
			assert.equal(typeof projectKey, "string");
			assert.ok(projectKey.length > 3);
		});


		var project = projects[projectKey];

		it("Project", function () {
			assert.notEqual(project, null);
			assert.equal(typeof project, "object");
		});

		it("Title", function () {
			let value = project.Title;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 3);
		});

		it("Thumbnail", function () {
			let value = project.Thumbnail;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 10);
		});

		// it("Date", function () {
		// 	let value = project.Date;
		// 	assert.notEqual(value, null);
		// });

		it("TimeSpent", function () {
			let value = project.TimeSpent;
			assert.notEqual(value, null);
		});

		it("NumPeople", function () {
			let value = project.NumPeople;
			assert.notEqual(value, null);
		});

		it("Awards", function () {
			let value = project.Awards;
			if (value != null)
			{
				assert.equal(typeof value, "string");
				assert.ok(value.length >= 5);
			}
		});

		it("QuickDescription", function () {
			let value = project.QuickDescription;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 10);
		});

		it("PagePath/Link", function () {
			let path = project.PagePath;
			let link = project.Link;

			// check only one is set
			assert.ok((path == null) != (link == null));

			if (path != null)
			{
				assert.equal(typeof path, "string");
				assert.ok(path.length >= 3);
			}

			if (link != null)
			{
				assert.equal(typeof link, "string");
				assert.ok(link.length >= 10);
			}
		});

		it("Skills", function () {
			let skills = project.Skills;
			assert.notEqual(skills, null);
			assert.ok(Array.isArray(skills));
			assert.ok(skills.length > 0);

			// check for duplicates
			let unique = [...new Set(skills)];
			assert.equal(unique.length, skills.length);

			// check each skill
			for (const skill of skills)
			{
				assert.notEqual(skill, null);
				assert.equal(typeof skill, "string");
				assert.ok(skill.length >= 3);


				// check the skill is in the skills config
				let skillConfig = skillsConfig[skill];
				assert.notEqual(skillConfig, null);
			}
		});

		it("Links", function () {
			var links = project.Links;
			assert.notEqual(links, null);
			assert.equal(typeof links, "object");

			// check each link
			for (const linkKey of Object.keys(links))
			{
				let link = links[linkKey];
				assert.notEqual(link, null);
				assert.equal(typeof link, "string");
				assert.ok(link.length >= 3);
			}

		});

		it("SubProjects", function () {
			let subProjects = project.SubProjects;
			assert.notEqual(subProjects, null);
			assert.ok(Array.isArray(subProjects));

			// check each subProject
			for (const subProject of subProjects)
			{
				assert.notEqual(subProject, null);
				assert.equal(typeof link, "string");
				assert.ok(link.length >= 3);

				// check the subProject is in the projects config
				let subProjectConfig = projects[subProject];
				assert.notEqual(subProjectConfig, null);
			}
		});
	});
}
});