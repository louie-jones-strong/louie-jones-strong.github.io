package config

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"time"
)

func LoadSiteConfig(path string) (SiteConfig, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return SiteConfig{}, fmt.Errorf("reading site config: %w", err)
	}
	var cfg SiteConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return SiteConfig{}, fmt.Errorf("parsing site config: %w", err)
	}
	return cfg, nil
}

func LoadIcons(path string) (map[string]Icon, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("reading icons: %w", err)
	}
	var icons map[string]Icon
	if err := json.Unmarshal(data, &icons); err != nil {
		return nil, fmt.Errorf("parsing icons: %w", err)
	}
	return icons, nil
}

func LoadProjects(path string) (map[string]Project, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("reading projects: %w", err)
	}
	var projects map[string]Project
	if err := json.Unmarshal(data, &projects); err != nil {
		return nil, fmt.Errorf("parsing projects: %w", err)
	}
	PostProcessProjects(projects)
	return projects, nil
}

func PostProcessProjects(projects map[string]Project) {
	for key, p := range projects {
		addStartEndDates(&p)
		addDuration(&p)
		projects[key] = p
	}
}

func parseDate(s string) (time.Time, bool) {
	if s == "" {
		return time.Time{}, false
	}
	if s == "Current" {
		return time.Now(), true
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
	// try just year
	var year int
	if _, err := fmt.Sscanf(s, "%d", &year); err == nil && year > 1990 && year < 2100 {
		return time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC), true
	}
	return time.Time{}, false
}

func addStartEndDates(p *Project) {
	var startDate *time.Time
	var endDate *time.Time
	var startDateStr *string
	var endDateStr *string

	for _, tl := range p.Timelines {
		tlStart, startOk := parseDate(tl.StartDate)
		tlEnd, endOk := parseDate(tl.EndDate)

		if tl.EndDate == "Current" {
			now := time.Now()
			endDate = &now
			cur := "Current"
			endDateStr = &cur
		}

		if !startOk {
			continue
		}

		if tl.StartDate != "" {
			if startDate == nil || tlStart.Before(*startDate) {
				t := tlStart
				startDate = &t
				s := tl.StartDate
				startDateStr = &s
			}

			if endDateStr == nil || *endDateStr != "Current" {
				if endDate == nil || tlStart.After(*endDate) {
					t := tlStart
					endDate = &t
					s := tl.StartDate
					endDateStr = &s
				}
			}
		}

		if tl.EndDate != "" && endOk {
			if endDateStr == nil || *endDateStr != "Current" {
				if endDate == nil || tlEnd.After(*endDate) {
					t := tlEnd
					endDate = &t
					s := tl.EndDate
					endDateStr = &s
				}
			}
		}
	}

	p.StartDate = startDateStr
	p.EndDate = endDateStr
}

func addDuration(p *Project) {
	var totalDuration time.Duration

	for _, tl := range p.Timelines {
		start, startOk := parseDate(tl.StartDate)
		end, endOk := parseDate(tl.EndDate)

		if !startOk || !endOk {
			continue
		}

		d := end.Sub(start)
		if d <= 0 {
			continue
		}
		totalDuration += d
	}

	if totalDuration == 0 && p.StartDate != nil && p.EndDate != nil {
		start, startOk := parseDate(*p.StartDate)
		end, endOk := parseDate(*p.EndDate)
		if startOk && endOk {
			totalDuration = end.Sub(start)
		}
	}

	if totalDuration <= 0 {
		return
	}

	s := formatDuration(totalDuration)
	p.Duration = &s
}

func formatDuration(d time.Duration) string {
	days := d.Hours() / 24
	weeks := days / 7
	months := days / 30
	years := days / 365

	years = math.Round(years*2) / 2
	months = math.Round(months)
	weeks = math.Round(weeks)
	days = math.Round(days)

	switch {
	case years == 1:
		return "1 Year"
	case years >= 1:
		return fmt.Sprintf("%.1g Years", years)
	case months == 1:
		return "1 Month"
	case months >= 1:
		return fmt.Sprintf("%.0f Months", months)
	case weeks == 1:
		return "1 Week"
	case weeks >= 1:
		return fmt.Sprintf("%.0f Weeks", weeks)
	case days == 1:
		return "1 Day"
	default:
		return fmt.Sprintf("%.0f Days", days)
	}
}
