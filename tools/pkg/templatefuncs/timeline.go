package templatefuncs

import (
	"fmt"
	"math"
	"time"

	"sitebuilder/pkg/config"
)

// TimelineHeaderTick represents a tick mark on the timeline header
type TimelineHeaderTick struct {
	IsLargeYear bool
	Label       string
	Offset      int
}

// TimelineSubEntry represents a sub-timeline entry (a range or point event)
type TimelineSubEntry struct {
	IsRange      bool
	StartOffset  int
	EndOffset    int
	Duration     int
	EndIsCurrent bool
	Name         string
	ShowStartName bool
}

// TimelineEntry represents a project entry on the timeline
type TimelineEntry struct {
	ProjectKey string
	Title      string
	Link       string
	Tags       string
	Offset     int
	Duration   int
	Timelines  []TimelineSubEntry
}

// TimelineRenderData is the complete data needed to render the timeline component
type TimelineRenderData struct {
	DateScale    float64
	HeaderDays   int
	HeaderTicks  []TimelineHeaderTick
	Indents      [][]TimelineEntry
	ScrollToEnd  bool
	HybridScroll bool
}

func getDelta(start, end time.Time) int {
	return int(math.Ceil(end.Sub(start).Hours() / 24))
}

func parseDateForTimeline(s string, current time.Time) (time.Time, bool) {
	if s == "" {
		return time.Time{}, false
	}
	if s == "Current" {
		return current, true
	}
	formats := []string{
		"January 2, 2006",
		"January 2006",
		"2006-01-02",
		"Jan 2, 2006",
		"Jan 2006",
		"January, 2006",
		"January, 2 2006",
	}
	for _, f := range formats {
		t, err := time.Parse(f, s)
		if err == nil {
			return t, true
		}
	}
	var year int
	if n, _ := fmt.Sscanf(s, "%d", &year); n == 1 && year > 1990 && year < 2100 {
		return time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC), true
	}
	return time.Time{}, false
}

// BuildTimelineFunc is the template function
func BuildTimelineFunc(timelineData map[string]interface{}, pageData config.PageData) TimelineRenderData {
	return BuildTimelineRenderData(timelineData, pageData, time.Now())
}

// BuildTimelineRenderData builds timeline render data with a configurable "now" time (for testing)
func BuildTimelineRenderData(timelineData map[string]interface{}, pageData config.PageData, now time.Time) TimelineRenderData {
	showEventStartName := true
	if v, ok := timelineData["ShowEventStartName"]; ok && v != nil {
		if b, ok := v.(bool); ok {
			showEventStartName = b
		}
	}

	scrollToEnd := true
	if v, ok := timelineData["ScrollToEnd"]; ok && v != nil {
		if b, ok := v.(bool); ok {
			scrollToEnd = b
		}
	}

	hybridScroll := false
	if v, ok := timelineData["HybridScroll"]; ok && v != nil {
		if b, ok := v.(bool); ok {
			hybridScroll = b
		}
	}

	dateScale := 0.05
	if v, ok := timelineData["DateScale"]; ok && v != nil {
		switch fv := v.(type) {
		case float64:
			dateScale = fv
		case int:
			dateScale = float64(fv)
		}
	}

	minGap := 14
	if v, ok := timelineData["MinGap"]; ok && v != nil {
		switch iv := v.(type) {
		case int:
			minGap = iv
		case float64:
			minGap = int(iv)
		}
	}

	// Get project keys
	var projectKeys []string
	if v, ok := timelineData["Projects"]; ok && v != nil {
		switch pv := v.(type) {
		case []string:
			projectKeys = pv
		case []interface{}:
			for _, item := range pv {
				if s, ok := item.(string); ok {
					projectKeys = append(projectKeys, s)
				}
			}
		}
	}

	// Filter projects with start/end dates
	var validKeys []string
	for _, key := range projectKeys {
		proj, ok := pageData.Projects[key]
		if !ok {
			continue
		}
		if proj.StartDate != nil && proj.EndDate != nil {
			validKeys = append(validKeys, key)
		}
	}

	if len(validKeys) == 0 {
		return TimelineRenderData{DateScale: dateScale, ScrollToEnd: scrollToEnd, HybridScroll: hybridScroll}
	}

	// Find header range
	var headerStart, headerEnd time.Time
	for i, key := range validKeys {
		proj := pageData.Projects[key]
		start, _ := parseDateForTimeline(*proj.StartDate, now)
		end, _ := parseDateForTimeline(*proj.EndDate, now)

		if i == 0 {
			headerStart = start
			headerEnd = end
		} else {
			if start.Before(headerStart) {
				headerStart = start
			}
			if end.After(headerEnd) {
				headerEnd = end
			}
		}
	}

	// Round to year boundaries
	headerStart = time.Date(headerStart.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
	headerEnd = time.Date(headerEnd.Year()+1, 1, 1, 0, 0, 0, 0, time.UTC)

	// Apply overrides
	if v, ok := timelineData["HeaderStartOverride"]; ok && v != nil {
		if t, ok := v.(time.Time); ok {
			headerStart = t
		}
	}
	if v, ok := timelineData["HeaderEndOverride"]; ok && v != nil {
		if t, ok := v.(time.Time); ok {
			headerEnd = t
		}
	}

	headerDays := getDelta(headerStart, headerEnd)

	// Build header ticks
	var ticks []TimelineHeaderTick
	subDate := time.Date(headerStart.Year(), headerStart.Month(), headerStart.Day(), 0, 0, 0, 0, time.UTC)
	for !subDate.After(headerEnd) {
		offset := getDelta(headerStart, subDate)
		if subDate.Month() == 1 {
			ticks = append(ticks, TimelineHeaderTick{
				IsLargeYear: true,
				Label:       fmt.Sprintf("%d", subDate.Year()),
				Offset:      offset,
			})
		} else {
			ticks = append(ticks, TimelineHeaderTick{
				IsLargeYear: false,
				Offset:      offset,
			})
		}
		subDate = subDate.AddDate(0, 1, 0)
	}

	// Pack projects into indents
	type indentEntry struct {
		key   string
		start time.Time
		end   time.Time
	}

	var indents [][]indentEntry

	for _, key := range validKeys {
		proj := pageData.Projects[key]
		projStart, _ := parseDateForTimeline(*proj.StartDate, now)
		projEnd, _ := parseDateForTimeline(*proj.EndDate, now)

		// Find first indent with space
		fitted := false
		for i, indent := range indents {
			overlapping := false
			for _, entry := range indent {
				startDelta := math.Abs(float64(getDelta(projStart, entry.start)))
				endDelta := math.Abs(float64(getDelta(projStart, entry.end)))

				if entry.start.Before(projEnd) && entry.end.After(projStart) {
					overlapping = true
					break
				}
				if startDelta <= float64(minGap) || endDelta <= float64(minGap) {
					overlapping = true
					break
				}
			}
			if !overlapping {
				indents[i] = append(indents[i], indentEntry{key, projStart, projEnd})
				fitted = true
				break
			}
		}
		if !fitted {
			indents = append(indents, []indentEntry{{key, projStart, projEnd}})
		}
	}

	// Build render data
	var renderIndents [][]TimelineEntry
	for _, indent := range indents {
		var entries []TimelineEntry
		for _, ie := range indent {
			proj := pageData.Projects[ie.key]

			projStart := ie.start
			if projStart.Before(headerStart) {
				projStart = headerStart
			}
			projEnd := ie.end

			offset := getDelta(headerStart, projStart)
			dur := getDelta(projStart, projEnd)

			// Build link
			var link string
			if proj.PagePath != nil {
				link = pageData.PathToRoot + *proj.PagePath + ".html"
			} else if proj.Link != nil {
				link = *proj.Link
			}
			if proj.HideLink {
				link = ""
			}

			// Build sub-timelines
			var subEntries []TimelineSubEntry
			for _, tl := range proj.Timelines {
				subStart, startOk := parseDateForTimeline(tl.StartDate, now)
				if !startOk {
					continue
				}
				subStartOffset := getDelta(projStart, subStart)

				if tl.EndDate != "" {
					subEnd, endOk := parseDateForTimeline(tl.EndDate, now)
					if !endOk {
						continue
					}
					subEndOffset := getDelta(projStart, subEnd)
					subDur := getDelta(subStart, subEnd)

					name := ""
					if tl.Name != nil {
						name = *tl.Name
					}

					subEntries = append(subEntries, TimelineSubEntry{
						IsRange:      true,
						StartOffset:  subStartOffset,
						EndOffset:    subEndOffset,
						Duration:     subDur,
						EndIsCurrent: tl.EndDate == "Current",
						Name:         name,
						ShowStartName: showEventStartName,
					})
				} else {
					subEntries = append(subEntries, TimelineSubEntry{
						IsRange:     false,
						StartOffset: subStartOffset,
					})
				}
			}

			entries = append(entries, TimelineEntry{
				ProjectKey: ie.key,
				Title:      proj.Title,
				Link:       link,
				Tags:       proj.Tags,
				Offset:     offset,
				Duration:   dur,
				Timelines:  subEntries,
			})
		}
		renderIndents = append(renderIndents, entries)
	}

	return TimelineRenderData{
		DateScale:    dateScale,
		HeaderDays:   headerDays,
		HeaderTicks:  ticks,
		Indents:      renderIndents,
		ScrollToEnd:  scrollToEnd,
		HybridScroll: hybridScroll,
	}
}
