enum ScreenKey {
	Admin,
	AotdHistory,
	Author,
	Blog,
	Comments,
	Download,
	EmailConfirmation,
	EmailSubscriptions,
	ExtensionRemoval,
	Faq,
	FreeTrial,
	Home,
	Leaderboards,
	Mission,
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