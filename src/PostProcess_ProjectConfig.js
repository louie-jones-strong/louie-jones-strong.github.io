
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
	let duration = null;
	for (const timeline of project.Timelines)
	{
		let timelineStartDate = new Date(timeline.StartDate);
		let timelineEndDate = new Date(timeline.EndDate);

		if (timeline.EndDate == "Current")
		{
			timelineEndDate = new Date();
		}

		if (isNaN(timelineStartDate) || isNaN(timelineEndDate))
		{
			continue;
		}

		let timelineDuration = timelineEndDate - timelineStartDate;

		if (timelineDuration <= 0)
		{
			continue;
		}

		if (duration == null)
		{
			duration = 0;
		}

		duration += timelineDuration;
	}

	// calculate duration from start/end dates
	if (duration == null)
	{
		let startDate = new Date(project.StartDate);
		let endDate = new Date(project.EndDate);

		if (project.EndDate == "Current")
		{
			endDate = new Date();
		}

		if (isNaN(startDate) || isNaN(endDate))
		{
			return;
		}

		duration = endDate - startDate;
	}


	if (duration <= 0)
	{
		return;
	}

	let durationStr = FormatDurationStr(duration);

	project.Duration = durationStr;
}


function FormatDurationStr(duration)
{
	let days = duration / (1000 * 60 * 60 * 24);
	let weeks = days / 7;
	let months = days / 30;
	let years = days / 365;


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

	return durationStr;
}








exports.PostProcessProjectConfig = PostProcessProjectConfig;