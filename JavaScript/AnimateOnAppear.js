window.addEventListener("scroll", Reveal);
Reveal();

function Reveal()
{
	var reveals = document.querySelectorAll(".reveal");

	for(var i = 0; i < reveals.length; i++)
	{

		var windowHeight = window.innerHeight;
		var revealTop = reveals[i].getBoundingClientRect().top;
		var revealPoint = 0;

		if(revealTop < windowHeight - revealPoint)
		{
			reveals[i].classList.add("shown");
			reveals[i].classList.remove("hidden");
		}
		else
		{
			reveals[i].classList.remove("shown");
			reveals[i].classList.add("hidden");
		}
	}
}