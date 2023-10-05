class TagFilter
{
//#region Init
	constructor(holderId, tags)
	{
		console.log("TagFilter constructor holderId: ", holderId);
		this.Tags = tags
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
		if (this.Tags[tag] == null)
		{
			console.error("TagFilter.ToggleTag: tag not found: ", tag);
			return;
		}
		this.Tags[tag] -= 1;

		if (this.Tags[tag] < -1)
		{
			this.Tags[tag] = 1;
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

		let numItemsShown = 0;
		let items = holder.children;
		for (let index = 0; index < items.length; index++)
		{
			const item = items[index];
			let show = true;

			let tagsAttribute = item.getAttribute("tags");
			if (tagsAttribute != null)
			{
				let tags = tagsAttribute.split(" ");
				show = this.ItemMatches(tags, this.Tags);
			}


			if (show)
			{
				item.classList.remove("filtered");
				numItemsShown += 1;
			}
			else
			{
				item.classList.add("filtered");
			}
		}

		if (numItemsShown == 0)
		{
			// todo show text saying no items match
		}
	}

	ItemMatches(itemTags, filterTags)
	{
		let matches = true;
		if (filterTags.size == 0)
		{
			return matches;
		}

		let itemTagsSet = new Set(itemTags);

		for (const filterTag in filterTags)
		{
			let filterValue = filterTags[filterTag];

			if (filterValue == 0)
			{
				continue;
			}
			else if (filterValue == 1)
			{
				if (!itemTagsSet.has(filterTag))
				{
					matches = false;
					break;
				}
			}
			else if (filterValue == -1)
			{
				if (itemTagsSet.has(filterTag))
				{
					matches = false;
					break;
				}
			}
		}

		return matches;
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
				let tagValue = this.Tags[tag];
				if (tagValue == 1)
				{
					item.classList.add("positive");
					item.classList.remove("neutral");
					item.classList.remove("negative");
				}
				else if (tagValue == 0)
				{
					item.classList.remove("positive");
					item.classList.add("neutral");
					item.classList.remove("negative");
				}
				else if (tagValue == -1)
				{
					item.classList.remove("positive");
					item.classList.remove("neutral");
					item.classList.add("negative");
				}
				else
				{
					console.error("TagFilter.UpdateToggles: tagValue not found: ", tagValue);
				}
			}
		}
	}
}