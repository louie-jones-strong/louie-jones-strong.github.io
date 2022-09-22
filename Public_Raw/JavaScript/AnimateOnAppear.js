window.addEventListener("scroll", Reveal);
Reveal();

function Reveal()
{
	let reveals = document.querySelectorAll(".reveal");

	for(let i = 0; i < reveals.length; i++)
	{

		let windowHeight = window.innerHeight;
		let revealTop = reveals[i].getBoundingClientRect().top;
		let revealPoint = 0;

		if(revealTop < windowHeight - revealPoint)
		{
			reveals[i].classList.add("shown");
			reveals[i].classList.remove("hidden");
		}
		else if (!reveals[i].classList.contains("shown"))
		{
			reveals[i].classList.remove("shown");
			reveals[i].classList.add("hidden");
		}
	}
}