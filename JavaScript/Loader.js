HideContent();

$(window).on("load", ShowContent);


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
	$("#loaderHolder").fadeOut("slow");

	var contents = document.getElementsByClassName("content");

	for (let index = 0; index < contents.length; index++)
	{
		const item = contents[index];
		item.classList.remove("hide");
	}
}