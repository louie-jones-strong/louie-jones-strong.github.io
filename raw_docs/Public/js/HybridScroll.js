


window.addEventListener('load', function () {
	const hybridScrolls = [...document.querySelectorAll('.hybridScroll_Container')];

	window.addEventListener('scroll', (e) => {
		for(let i = 0; i < hybridScrolls.length; i++)
		{
			UpdateScroll(hybridScrolls[i]);
		}
	});

	window.addEventListener('resize', (e) => {
		for(let i = 0; i < hybridScrolls.length; i++)
		{
			RefreshSize(hybridScrolls[i]);

			UpdateScroll(hybridScrolls[i]);
		}
	});


	for(let i = 0; i < hybridScrolls.length; i++)
	{
		RefreshSize(hybridScrolls[i]);

		UpdateScroll(hybridScrolls[i]);
	}
});




function RefreshSize(hybridScrollContainer)
{
	var stickyContainer = hybridScrollContainer.querySelector('.hybridScroll_StickyContainer');
	var horizontalScroll = hybridScrollContainer.querySelector('.hybridScroll_HorizontalScroll');

	// how many times the width of the screen is the width of the horizontal scroll
	let multiplierOfScreenSize = horizontalScroll.scrollWidth / window.innerWidth;

	hybridScrollContainer.style.height = `${multiplierOfScreenSize * 100}vh`;
}






function UpdateScroll(hybridScrollContainer)
{
	var stickyContainer = hybridScrollContainer.querySelector('.hybridScroll_StickyContainer');
	var horizontalScroll = hybridScrollContainer.querySelector('.hybridScroll_HorizontalScroll');

	const offsetTop = stickyContainer.parentElement.offsetTop;

	let percentage = ((window.scrollY - offsetTop) / window.innerHeight) * 100;

	let multiplierOfScreenSize = horizontalScroll.scrollWidth / window.innerWidth;

	var maxPercentage = multiplierOfScreenSize * 100 -100;
	if (percentage < 0)
	{
		percentage = 0;
	}
	else if (percentage > maxPercentage)
	{
		percentage = maxPercentage;
	}
	else
	{
		percentage = percentage;
	}

	horizontalScroll.style.transform = `translate3d(${-(percentage)}vw, 0, 0)`;
}