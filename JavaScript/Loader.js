HideContent();

window.addEventListener('load', function () {
	ShowContent();
});


function HideContent()
{
	let contents = document.getElementsByClassName("content");

	for (let index = 0; index < contents.length; index++)
	{
		const item = contents[index];
		item.classList.add("hide");
	}
}

function ShowContent()
{
	let loaderHolder = document.getElementById("loaderHolder");
	loaderHolder.classList.add("loaded");

	let contents = document.getElementsByClassName("content");

	for (let index = 0; index < contents.length; index++)
	{
		const item = contents[index];
		item.classList.remove("hide");
	}
}