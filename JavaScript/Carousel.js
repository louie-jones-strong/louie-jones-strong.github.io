// this code has was originally from this website:
// https://www.w3schools.com/howto/howto_js_slideshow.asp
// but I modified the code for use in this website


//Starting cover image index
let slideIndex = 0;
ShowSlides();

function ShowSlides()
{
	let i;
	let slides = document.getElementsByClassName("slide");
	let dots = document.getElementsByClassName("slide-dot");

	if (slideIndex >= slides.length)
	{
		slideIndex = 0;
	}

	for (i = 0; i < slides.length; i++)
	{
		if (i == slideIndex)
		{
			ResetVideos(slides[i]);

			slides[i].className = "slide active";

			if (dots.length > i)
			{
				dots[i].className = "slide-dot activeDot";
			}
		}
		else
		{
			slides[i].className = "slide inactive";

			if (dots.length > i)
			{
				dots[i].className = "slide-dot inactiveDot";
			}
		}
	}

	slideIndex++;

	// Change cover image every 5 seconds
	if (slides.length > 1)
	{
		setTimeout(ShowSlides, 5000);
	}
}

function ResetVideos(dicObject)
{
	let children = dicObject.children;
	for (i = 0; i < children.length; i++)
	{
		children[i].currentTime = 0;
	}
}