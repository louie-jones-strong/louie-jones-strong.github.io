package templatefuncs

import (
	"encoding/json"
	"fmt"
	"html/template"
	"reflect"
	"time"

	"sitebuilder/pkg/config"
)

// FuncMap returns the complete template function map
func FuncMap() template.FuncMap {
	return template.FuncMap{
		"dict":               Dict,
		"list":               List,
		"toJSON":             ToJSON,
		"deref":              Deref,
		"notNil":             NotNil,
		"add":                func(a, b int) int { return a + b },
		"sub":                func(a, b int) int { return a - b },
		"lt":                 func(a, b int) bool { return a < b },
		"gt":                 func(a, b int) bool { return a > b },
		"seq":                Seq,
		"last":               func(i, n int) bool { return i == n-1 },
		"lastElem":           LastElem,
		"safeURL":            func(s string) template.URL { return template.URL(s) },
		"safeHTML":           func(s string) template.HTML { return template.HTML(s) },
		"safeJS":             func(s string) template.JS { return template.JS(s) },
		"numEq":              NumEq,
		"numGt":              NumGt,
		"date":               DateFunc,
		"buildCard":          BuildCardFunc,
		"buildTimeline":      BuildTimelineFunc,
		"projectToQuickInfo": ProjectToQuickInfo,
		"iconKeys":           IconKeys,
		"projectKeys":        ProjectKeys,
		"sprintf":            fmt.Sprintf,
	}
}

func Dict(values ...interface{}) (map[string]interface{}, error) {
	if len(values)%2 != 0 {
		return nil, fmt.Errorf("dict requires even number of arguments")
	}
	m := make(map[string]interface{}, len(values)/2)
	for i := 0; i < len(values); i += 2 {
		key, ok := values[i].(string)
		if !ok {
			return nil, fmt.Errorf("dict keys must be strings, got %T", values[i])
		}
		m[key] = values[i+1]
	}
	return m, nil
}

func List(values ...interface{}) []interface{} {
	return values
}

func ToJSON(v interface{}) template.JS {
	b, err := json.Marshal(v)
	if err != nil {
		return template.JS("null")
	}
	return template.JS(b)
}

func Deref(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

func NotNil(v interface{}) bool {
	if v == nil {
		return false
	}
	rv := reflect.ValueOf(v)
	switch rv.Kind() {
	case reflect.Ptr, reflect.Interface, reflect.Slice, reflect.Map, reflect.Chan, reflect.Func:
		return !rv.IsNil()
	}
	return true
}

func Seq(n int) []int {
	s := make([]int, n)
	for i := range s {
		s[i] = i
	}
	return s
}

func LastElem(slice interface{}) interface{} {
	if slice == nil {
		return nil
	}
	rv := reflect.ValueOf(slice)
	if rv.Kind() != reflect.Slice {
		return nil
	}
	if rv.Len() == 0 {
		return nil
	}
	return rv.Index(rv.Len() - 1).Interface()
}

func NumEq(a interface{}, b float64) bool {
	if a == nil {
		return false
	}
	switch v := a.(type) {
	case float64:
		return v == b
	case int:
		return float64(v) == b
	case int64:
		return float64(v) == b
	case int32:
		return float64(v) == b
	}
	return false
}

func NumGt(a interface{}, b float64) bool {
	if a == nil {
		return false
	}
	switch v := a.(type) {
	case float64:
		return v > b
	case int:
		return float64(v) > b
	case int64:
		return float64(v) > b
	case int32:
		return float64(v) > b
	}
	return false
}

func DateFunc(year, month, day int) time.Time {
	return time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
}

func ProjectToQuickInfo(p config.Project) map[string]interface{} {
	startDate := ""
	if p.StartDate != nil {
		startDate = *p.StartDate
	}
	timeSpent := ""
	if p.TimeSpent != nil {
		timeSpent = *p.TimeSpent
	}
	duration := ""
	if p.Duration != nil {
		duration = *p.Duration
	}

	links := map[string]interface{}{
		"GithubLink":      p.Links.GithubLink,
		"ItchLink":        p.Links.ItchLink,
		"WebsiteLink":     p.Links.WebsiteLink,
		"InstagramLink":   p.Links.InstagramLink,
		"GooglePlayLink":  p.Links.GooglePlayLink,
		"AppleArcadeLink": p.Links.AppleArcadeLink,
		"AppStoreLink":    p.Links.AppStoreLink,
	}

	hasLinks := false
	for _, v := range links {
		if v != nil {
			hasLinks = true
			break
		}
	}

	var linksVal interface{}
	if hasLinks {
		linksVal = links
	}

	return map[string]interface{}{
		"StartDate":      startDate,
		"TimeSpent":      timeSpent,
		"Duration":       duration,
		"NumPeople":      p.NumPeople,
		"Awards":         p.Awards,
		"Links":          linksVal,
		"Skills":         p.Skills,
		"HideSkillTitle": false,
	}
}

func IconKeys(icons map[string]config.Icon) []string {
	keys := make([]string, 0, len(icons))
	for k := range icons {
		keys = append(keys, k)
	}
	return keys
}

func ProjectKeys(projects map[string]config.Project) []string {
	keys := make([]string, 0, len(projects))
	for k := range projects {
		keys = append(keys, k)
	}
	return keys
}
