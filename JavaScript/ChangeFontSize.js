const minFontScale = 0.75;
const maxFontScale = 3;


let FontScale = localStorage.getItem("fontSize");
if (FontScale === null)
{
	FontScale = 1;
}

SetFontSize(FontScale)


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
	if (fontScale > maxFontScale)
	{
		fontScale = maxFontScale;
	}

	if (fontScale < minFontScale)
	{
		fontScale = minFontScale;
	}

	FontScale = parseFloat(fontScale);

	document.documentElement.style.setProperty('--FontScale', fontScale);
	localStorage.setItem("fontSize", fontScale);
}