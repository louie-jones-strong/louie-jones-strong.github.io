package templatefuncs

import (
	"sitebuilder/pkg/config"
)

// BuildCardFunc is the template function for building card render data
func BuildCardFunc(cardInput map[string]interface{}, pageData config.PageData) map[string]interface{} {
	result := make(map[string]interface{})

	// Copy direct fields
	for k, v := range cardInput {
		result[k] = v
	}

	// If ProjectData is set, build from it
	projRaw, hasProj := cardInput["ProjectData"]
	if !hasProj || projRaw == nil {
		return result
	}

	proj, ok := projRaw.(config.Project)
	if !ok {
		return result
	}

	result["Title"] = proj.Title
	result["Body"] = proj.QuickDescription
	result["Thumbnail"] = ""
	if proj.Thumbnail != nil {
		result["Thumbnail"] = *proj.Thumbnail
	}
	result["Tags"] = proj.Tags
	result["Hide"] = proj.Hide

	// Build QuickInfo
	qi := ProjectToQuickInfo(proj)

	// Set link
	var link interface{}
	if proj.PagePath != nil {
		link = pageData.PathToRoot + *proj.PagePath + ".html"
	} else if proj.Link != nil {
		link = *proj.Link
	}
	if proj.HideLink {
		link = nil
	}
	result["Link"] = link

	// If has thumbnail, hide skills from quickinfo
	if proj.Thumbnail != nil && *proj.Thumbnail != "" {
		qi["Skills"] = nil
		// Shorten start date if too long
		if sd, ok := qi["StartDate"].(string); ok && len(sd) > 15 {
			qi["StartDate"] = ""
		}
		qi["Awards"] = nil
	}
	qi["HideSkillTitle"] = true
	result["QuickInfoData"] = qi

	return result
}
