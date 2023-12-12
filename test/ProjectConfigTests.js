const assert = require("assert");
const fs = require("fs");


describe("Projects Config", function ()
{


// load the skills config file
var iconsConfig = require("../config/Icons.json");
it("Skills Config Loaded", function () {
	assert.notEqual(iconsConfig, null);
	assert.equal(typeof iconsConfig, "object");
	assert.ok(Object.keys(iconsConfig).length > 0);
});


// load the projects config file
var projects = require("../config/Projects.json");
it("Project Config Loaded", function () {
	assert.notEqual(projects, null);
});


let projectIndex = 0;
for (const projectKey in projects)
{
	projectIndex += 1;

	describe(projectIndex + " Key: " + projectKey, function ()
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

			if (value != null)
			{
				assert.equal(typeof value, "string");
				assert.ok(value.length >= 10);
			}
		});

		it("Dates", function () {
			// year 2000
			let earliestDate = new Date(2000, 0, 1);

			// current date + 1 year
			let latestDate = new Date();
			latestDate.setFullYear(latestDate.getFullYear() + 1);

			function DateCheck(dateStr)
			{
				if (dateStr == null)
				{
					return null;
				}

				assert.ok(typeof dateStr == "string");
				var date = new Date(dateStr);
				if (dateStr == "Current")
				{
					date = new Date();
				}
				assert.ok(date instanceof Date);
				assert.ok(!isNaN(date), `date: (${date}) is not a valid date`);

				assert.ok(date >= earliestDate, `date: (${date}) is before earliest date (${earliestDate})`);
				assert.ok(date <= latestDate, `date: (${date}) is after latest date (${latestDate})`);
				return date;
			}


			assert.notEqual(project.Timelines, null);
			assert.ok(Array.isArray(project.Timelines));

			let lastStartDate = null;
			let lastEndDate = null;
			for (const timeline of project.Timelines)
			{
				let startDate = DateCheck(timeline.StartDate);

				let endDate = DateCheck(timeline.EndDate);
				if (timeline.EndDate == "Current")
				{
					endDate = latestDate;
				}

				assert.ok(startDate != null, "Timeline should have a start date");
				if (lastStartDate != null)
				{
					if (lastEndDate != null)
					{
						assert.notEqual(endDate, null, "Timeline should have an end date");

						// check no overlapping timelines
						assert.ok(startDate >= lastEndDate, `startDate: (${startDate}) is before lastEndDate (${lastEndDate})`);
					}
					else
					{
						// check no overlapping timelines
						assert.ok(startDate >= lastStartDate, `startDate: (${startDate}) is before lastStartDate (${lastStartDate})`);
					}
				}

				if (endDate != null)
				{
					assert.ok(startDate <= endDate, `startDate: (${startDate}) is after endDate (${endDate})`);
				}

				lastStartDate = startDate;
				lastEndDate = endDate;
			}
		});

		// it("TimeSpent", function () {
		// 	let value = project.TimeSpent;
		// 	assert.notEqual(value, null);
		// });

		// it("NumPeople", function () {
		// 	let value = project.NumPeople;
		// 	assert.notEqual(value, null);
		// });

		it("Awards", function () {
			let value = project.Awards;
			if (value != null)
			{
				assert.equal(typeof value, "string");
				assert.ok(value.length >= 1);
			}
		});

		it("QuickDescription", function () {
			let value = project.QuickDescription;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");
			assert.ok(value.length >= 10);

			// check no new lines
			assert.ok(!value.includes("\n"));

			// check they end with a full stop
			assert.ok(value.endsWith("."));

			// check they start with a capital letter
			assert.ok(value[0] === value[0].toUpperCase());

			// check they don't start with a space
			assert.ok(value[0] !== " ");

			// check there is no double spaces
			assert.ok(!value.includes("  "));

			// check there are no lower case I's
			assert.ok(!value.includes(" i "));
		});

		it("PagePath/Link", function () {
			let path = project.PagePath;
			let link = project.Link;

			// check only one is set
			// assert.ok((path == null) != (link == null));

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
			// assert.ok(skills.length > 0);

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
				let iconConfig = iconsConfig[skill];
				assert.notEqual(iconConfig, null, "Skill " + skill + " not found in icon config");
			}

			// contains sub project skills
			let subProjects = project.SubProjects;
			if (subProjects != null)
			{
				for (const subProject of subProjects)
				{
					let subProjectConfig = projects[subProject];
					assert.notEqual(subProjectConfig, null);

					let subProjectSkills = subProjectConfig.Skills;
					assert.notEqual(subProjectSkills, null);

					for (const subProjectSkill of subProjectSkills)
					{
						let includesSkill = skills.includes(subProjectSkill)
						let message = subProjectSkill + " skill found in sub project " + subProject + " but not in main project " + projectKey;
						assert.ok(includesSkill, message);
					}
				}
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
				assert.equal(typeof subProject, "string");
				assert.ok(subProject.length >= 3);

				// check the subProject is in the projects config
				let subProjectConfig = projects[subProject];
				assert.notEqual(subProjectConfig, null);
			}
		});

		it("Hide", function () {
			let value = project.Hide;
			assert.notEqual(value, null);
			assert.equal(typeof value, "boolean");

		});

		it("HideLink", function () {
			let value = project.HideLink;
			assert.notEqual(value, null);
			assert.equal(typeof value, "boolean");

		});

		it("Tags", function () {
			let value = project.Tags;
			assert.notEqual(value, null);
			assert.equal(typeof value, "string");

		});
	});
}
});