class TagFilter
{
//#region Init
	constructor(holderId, startTags)
	{
		console.log("TagFilter constructor holderId: ", holderId);
		this.Tags = new Set(startTags);
		this.HolderId = holderId;
		this.FilterOptionsId = holderId + "-Options";


		this.SetupHolderChildren();

		this.UpdateToggles();
		this.Filter();
	}

	SetupHolderChildren()
	{
		// add filterable class to all children
		let holder = document.getElementById(this.HolderId);
		if (holder == null)
		{
			console.warn("TagFilter.constructor: holder is null");
			return;
		}
		let items = holder.children;
		for (let index = 0; index < items.length; index++)
		{
			const item = items[index];
			item.classList.add("filterable");
		}
	}

//#endregion Init



	ToggleTag(tag)
	{
		if (this.Tags.has(tag))
		{
			this.Tags.delete(tag);
		}
		else
		{
			this.Tags.add(tag);
		}
		this.UpdateToggles();
		this.Filter();
	}

	Filter()
	{
		// console.log("TagFilter.Filter Tags: ", this.Tags);

		let holder = document.getElementById(this.HolderId);
		if (holder == null)
		{
			console.warn("TagFilter.Filter: holder is null");
			return;
		}
		let items = holder.children;

		for (let index = 0; index < items.length; index++)
		{
			const item = items[index];
			let hide = true;
			if (this.Tags.size == 0)
			{
				hide = false;
			}
			else
			{
				let tagsAttribute = item.getAttribute("tags");
				if (tagsAttribute != null)
				{
					let tags = tagsAttribute.split(" ");
					if (this.Tags.size > 0)
					{
						for (let index = 0; index < tags.length; index++)
						{
							const tag = tags[index];

							if (this.Tags.has(tag))
							{
								hide = false;
								break;
							}
						}
					}
				}
			}

			if (hide)
			{
				item.classList.add("filtered");
			}
			else
			{
				item.classList.remove("filtered");
			}
		}
	}

	UpdateToggles()
	{
		let options = document.getElementById(this.FilterOptionsId);
		if (options == null)
		{
			console.warn("TagFilter.UpdateToggles: options is null");
			return;
		}

		let items = options.children;
		for (let index = 0; index < items.length; index++)
		{
			const item = items[index];
			let tag = item.getAttribute("tag");
			if (tag != null)
			{
				if (this.Tags.has(tag))
				{
					item.classList.add("positive");
				}
				else
				{
					item.classList.remove("positive");
				}
			}
		}
	}
}