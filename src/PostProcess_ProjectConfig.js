
function PostProcessProjectConfig(projectConfig)
{
	for (const projectKey of Object.keys(projectConfig))
	{
		let project = projectConfig[projectKey];

		AddProjectStartEndDates(project);
		AddProjectDuration(project);
	}
}

function AddProjectStartEndDates(project)
{
	let startDate = null;
	let endDate = null;

	let startDateStr = null;
	let endDateStr = null;
	for (const timeline of project.Timelines)
	{
		let timelineStartDate = new Date(timeline.StartDate);
		let timelineEndDate = new Date(timeline.EndDate);

		if (timeline.EndDate == "Current")
		{
			timelineEndDate = new Date();
			endDate = new Date();
			endDateStr = "Current";
		}

		if (isNaN(timelineStartDate) || isNaN(timelineEndDate))
		{
			continue;
		}

		if (timeline.StartDate != null)
		{
			if (startDate == null || timelineStartDate < startDate)
			{
				startDate = timelineStartDate;
				startDateStr = timeline.StartDate;
			}

			if (endDate == null || (timelineStartDate > endDate && endDateStr != "Current"))
			{
				endDate = timelineStartDate;
				endDateStr = timeline.StartDate;
			}
		}

		if (timeline.EndDate != null && (endDate == null || (timelineEndDate > endDate && endDateStr != "Current")))
		{
			endDate = timelineStartDate;
			endDateStr = timeline.EndDate;
		}
	}


	project.StartDate = startDateStr;
	project.EndDate = endDateStr;
}

function AddProjectDuration(project)
{
	if (project.EndDate == "Current")
	{
		return;
	}

	// add project duration
	let startDate = new Date(project.StartDate);
	let endDate = new Date(project.EndDate);

	if (isNaN(startDate) || isNaN(endDate))
	{
		return;
	}

	let duration = endDate - startDate;

	if (duration <= 0)
	{
		return;
	}

	let days = duration / (1000 * 60 * 60 * 24);
	let weeks = days / 7;
	let months = days / 30;
	let years = months / 12;


	years = Math.round(years * 2) / 2;
	months = Math.round(months);
	weeks = Math.round(weeks);
	days = Math.round(days);

	let durationStr = "";
	if (years == 1)
	{
		durationStr = years + " Year";
	}
	else if (years >= 1)
	{
		durationStr = years + " Years";
	}
	else if (months == 1)
	{
		durationStr = months + " Month";
	}
	else if (months >= 1)
	{
		durationStr = months + " Months";
	}
	else if (weeks == 1)
	{
		durationStr = weeks + " Week";
	}
	else if (weeks >= 1)
	{
		durationStr = weeks + " Weeks";
	}
	else if (days == 1)
	{
		durationStr = days + " Day";
	}
	else
	{
		durationStr = days + " Days";
	}

	project.Duration = durationStr;
}








exports.PostProcessProjectConfig = PostProcessProjectConfig;