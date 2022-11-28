const MinFontScale = 0.75;
const MaxFontScale = 2;

const ThemeKey = "theme";
const GrayScaleKey = "grayScale";
const FontSizeKey = "fontSize";

const DefaultTheme = "dark";
const DefaultGrayScale = "off";
const DefaultFontSize = 1;



let CurrentTheme = localStorage.getItem(ThemeKey);
if (CurrentTheme === null)
	CurrentTheme = DefaultTheme;


let GrayScaleIsOn = localStorage.getItem(GrayScaleKey);
if (GrayScaleIsOn === null)
	GrayScaleIsOn = DefaultGrayScale;


let FontScale = localStorage.getItem(FontSizeKey);
if (FontScale === null)
	FontScale = DefaultFontSize;



SetTheme(CurrentTheme == "dark");
SetGreyScale(GrayScaleIsOn == "on");
SetFontSize(FontScale);


function Reset()
{
	SetTheme(DefaultTheme == "dark");
	SetGreyScale(DefaultGrayScale == "on");
	SetFontSize(DefaultFontSize);
}

//#region Theme
function ToggleTheme()
{
	let currentTheme = localStorage.getItem("theme");

	SetTheme(currentTheme == "light");
}

function SetTheme(isDarkTheme)
{
	let darkModeIcon = document.getElementById("darkModeIcon");
	let lightModeIcon = document.getElementById("lightModeIcon");

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
	localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
}
//#endregion


//#region GreyScale
function ToggleGreyScale()
{
	let currentTheme = localStorage.getItem("grayScale");

	SetGreyScale(currentTheme == "off");
}


function SetGreyScale(isOn)
{
	let greyScaleOffIcon = document.getElementById("greyScaleOffIcon");
	let greyScaleOnIcon = document.getElementById("greyScaleOnIcon");

	if (isOn)
	{
		document.body.classList.add("greyScale");

		if (greyScaleOffIcon != null)
			greyScaleOffIcon.classList.remove("hide");

		if (greyScaleOnIcon != null)
			greyScaleOnIcon.classList.add("hide");

	}
	else
	{
		document.body.classList.remove("greyScale");

		if (greyScaleOffIcon != null)
			greyScaleOffIcon.classList.add("hide");

		if (greyScaleOnIcon != null)
			greyScaleOnIcon.classList.remove("hide");
	}

	localStorage.setItem("grayScale", isOn ? "on" : "off");
}
//#endregion


//#region FontSize
function IncreaseFontSize()
{
	SetFontSize(FontScale + 0.25);
}

function DecreaseFontSize()
{
	SetFontSize(FontScale - 0.25);
}

function SetFontSize(fontScale)
{
	if (fontScale > MaxFontScale)
	{
		fontScale = MaxFontScale;
	}

	if (fontScale < MinFontScale)
	{
		fontScale = MinFontScale;
	}

	FontScale = parseFloat(fontScale);

	document.documentElement.style.setProperty('--FontScale', fontScale);
	localStorage.setItem(FontSizeKey, fontScale);
}
//#endregion