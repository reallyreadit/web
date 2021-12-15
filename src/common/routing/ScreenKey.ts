enum ScreenKey {
	Admin,
	AotdHistory,
	Author,
	BestEver,
	Blog,
	Comments,
	Contenders,
	Download,
	EmailConfirmation,
	EmailSubscriptions,
	ExtensionRemoval,
	Faq,
	Home,
	Leaderboards,
	Mission,
	MyFeed,
	MyImpact,
	MyReads,
	Notifications,
	Password,
	PrivacyPolicy,
	Profile,
	Read,
	Search,
	Settings,
	Stats,
	Subscribe,
	Team
}
export default ScreenKey;
export type ScreenParams = {
	[key: string]: string
};
export type ScreenKeyNavParams = {
	key: ScreenKey,
	params?: ScreenParams
};