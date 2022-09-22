let ExpandableList = document.getElementsByClassName("expandable");

WrapExpandableObjects();


function WrapExpandableObjects()
{

	for (let index = 0; index < ExpandableList.length; index++)
	{
		let expandable = ExpandableList[index];

		let expandableHolder = document.createElement('div');
		expandableHolder.classList.add("expandableHolder");

		expandable.parentElement.insertBefore(expandableHolder, expandable);
		expandableHolder.appendChild(expandable);

		// create icon
		let icon = document.createElement('span');
		icon.classList.add("expandableIcon");
		icon.classList.add("material-icons");
		icon.innerHTML = "open_in_full";
		expandableHolder.appendChild(icon);


		expandableHolder.onclick = function(){Expand(index)};
	}
}


function Expand(index)
{
	const clone = ExpandableList[index].cloneNode(true);
	clone.classList.remove("expandable");
	OpenOverlay(clone, true);
}


// popup api
function OpenPopup(bodyHtml)
{
	let content = `
		<div class="centeredFrame">
			<div class="glass popup">

				<div class="topButtonsHolder">
					<div></div>
					<button class="closePopup shaded" onclick='CloseOverlay()()'></button>
				</div>
				<div id="popupBody">
					${bodyHtml}
				</div>
			</div>
		</div>`;

	OpenOverlay(content);
}


// overlay
function OpenOverlay(content, isDomElement)
{
	let overlayHolder = document.getElementById("overlayHolder");
	overlayHolder.classList.add("overlayShowing");

	if (!content)
	{
		content = "";
		isDomElement = false;
	}

	if (isDomElement)
	{
		overlayHolder.appendChild(content);
	}
	else
	{
		overlayHolder.innerHTML = content;
	}


	// create close icon
	let closeIcon = document.createElement('span');
	closeIcon.classList.add("closeOverlayIcon");
	closeIcon.classList.add("material-icons");
	closeIcon.innerHTML = "close_fullscreen";

	overlayHolder.appendChild(closeIcon);
}

function CloseOverlay()
{
	let overlayHolder = document.getElementById("overlayHolder");
	overlayHolder.classList.remove("overlayShowing");
	overlayHolder.innerHTML = "";
}


document.onkeydown = function(key)
{
	if(key.key === "Escape")
	{
		CloseOverlay();
	}
}