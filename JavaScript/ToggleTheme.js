// this code has was originally from this website:
// https://anthonymarmont.com/portfolio
// but I modified the code for use in our website


var currentTheme = localStorage.getItem("theme");
if (currentTheme === null)
{
	currentTheme = "dark";
}

SetTheme(currentTheme == "dark")

function ToggleTheme()
{
	var currentTheme = localStorage.getItem("theme");

	SetTheme(currentTheme == "light");
}


function SetTheme(isDarkTheme)
{
	var darkModeIcon = document.getElementById("darkModeIcon");
	var lightModeIcon = document.getElementById("lightModeIcon");

	if (isDarkTheme)
	{
		document.body.classList.remove("light");
		document.body.classList.add("dark");

		darkModeIcon.classList.remove("hide");
		lightModeIcon.classList.add("hide");

	}
	else
	{
		document.body.classList.add("light");
		document.body.classList.remove("dark");

		darkModeIcon.classList.add("hide");
		lightModeIcon.classList.remove("hide");
	}
;
	localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
}

