HideContent();

window.addEventListener('load', function () {
	ShowContent();
});


function HideContent()
{
	var contents = document.getElementsByClassName("content");

	for (let index = 0; index < contents.length; index++)
	{
		const item = contents[index];
		item.classList.add("hide");
	}
}

function ShowContent()
{
	var loaderHolder = document.getElementById("loaderHolder");
	loaderHolder.classList.add("loaded");

	var contents = document.getElementsByClassName("content");

	for (let index = 0; index < contents.length; index++)
	{
		const item = contents[index];
		item.classList.remove("hide");
	}
}