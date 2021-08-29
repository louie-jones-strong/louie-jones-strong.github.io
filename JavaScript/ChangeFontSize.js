
var fontScale = localStorage.getItem("fontSize");
if (fontScale === null)
{
	fontScale = 1;
}

SetTheme(fontScale)

function SetFontSize(fontScale)
{
	document.documentElement.style.setProperty('--FontScale', fontScale);
	localStorage.setItem("fontSize", scaleIndex);
}