window.addEventListener("scroll", Reveal);

function Reveal()
{
	var reveals = document.querySelectorAll(".reveal");

	for(var i = 0; i < reveals.length; i++)
	{

		var windowHeight = window.innerHeight;
		var revealTop = reveals[i].getBoundingClientRect().top;
		var revealPoint = 150;

		if(revealTop < windowHeight - revealPoint)
		{
			reveals[i].classList.add("shown");
		}
		else
		{
			reveals[i].classList.remove("shown");
		}
	}
}