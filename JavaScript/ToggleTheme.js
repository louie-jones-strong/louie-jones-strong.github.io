// this code has was originally from this website:
// https://anthonymarmont.com/portfolio
// but I modified the code for use in our website


var currentTheme = localStorage.getItem("theme");
if (currentTheme === null)
{
	currentTheme = "light";
}

SetTheme(currentTheme == "dark")

function ToggleTheme()
{
	var currentTheme = localStorage.getItem("theme");

	SetTheme(currentTheme == "light")
}


function SetTheme(isDarkTheme)
{
	if (isDarkTheme)
	{
		document.body.classList.remove("light");
		document.body.classList.add("dark");
	}
	else
	{
		document.body.classList.add("light");
		document.body.classList.remove("dark");
	}
	localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
}

