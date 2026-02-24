package config

type SiteConfig struct {
	Raw_ViewsFolder     string
	Output_ViewsFolder  string
	Raw_StaticFolder    string
	Output_StaticFolder string
	HostURL             string
	DefaultThumbnail    string
	ContactLinks        ContactLinks
	AssetConfig         AssetConfig
}

type ContactLinks struct {
	LinkedIn          *string
	GitHub            *string
	ItchIo            *string
	Instagram         *string
	Twitter           *string
	Email             *string
	LeetCode          *string
	Kaggle            *string
	CVDownloadAllowed bool
}

type AssetConfig struct {
	ImageConfig   ImageConfig
	VideoConfig   VideoConfig
	NoCopyFolders []string
}

type ImageConfig struct {
	HorizontalResolutionsGroups []int
	OutputFormats               []string
}

type VideoConfig struct {
	HorizontalResolutionsGroups []int
	OutputFormats               []string
}

type Icon struct {
	IconPath  string
	Label     string
	ClassList string
}

type Project struct {
	Title            string
	Thumbnail        *string
	Timelines        []Timeline
	TimeSpent        *string
	NumPeople        interface{}
	Awards           interface{}
	QuickDescription string
	PagePath         *string
	Link             *string
	HideLink         bool
	Hide             bool
	Tags             string
	Skills           []string
	Links            ProjectLinks
	SubProjects      []string
	// Computed fields
	StartDate *string
	EndDate   *string
	Duration  *string
}

type Timeline struct {
	StartDate string
	EndDate   string
	Name      *string
}

type ProjectLinks struct {
	GithubLink      *string
	ItchLink        *string
	WebsiteLink     *string
	InstagramLink   *string
	GooglePlayLink  *string
	AppleArcadeLink *string
	AppStoreLink    *string
}

type PageData struct {
	IsRelease   bool
	PageName    string
	PageParent  string
	PathToRoot  string
	SiteConfig  SiteConfig
	Projects    map[string]Project
	Icons       map[string]Icon
	CurrentDate string
}

type PageContext struct {
	PageData    PageData
	ProjectData Project
}
