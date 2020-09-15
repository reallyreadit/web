export enum DisplayTheme {
	Light = 1,
	Dark = 2
}
export default interface DisplayPreference {
	hideLinks: boolean,
	textSize: number,
	theme: DisplayTheme
}
export function getClientPreferredColorScheme() {
	if (
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.matches
	) {
		return DisplayTheme.Dark;
	}
	return DisplayTheme.Light;
}
export function getClientDefaultDisplayPreference() {
	return {
		hideLinks: true,
		textSize: 1,
		theme: getClientPreferredColorScheme()
	};
}
export function getDisplayPreferenceChangeMessage(prevPreference: DisplayPreference, nextPreference: DisplayPreference) {
	let message: string;
	if (nextPreference.hideLinks !== prevPreference.hideLinks) {
		message = `Links ${nextPreference.hideLinks ? 'Disabled' : 'Enabled'}`;
	} else if (nextPreference.textSize !== prevPreference.textSize) {
		message = `Text Size ${nextPreference.textSize > prevPreference.textSize ? 'Increased' : 'Decreased'}`;
	} else if (nextPreference.theme !== prevPreference.theme) {
		message = `${nextPreference.theme === DisplayTheme.Dark ? 'Dark' : 'Light'} Theme Enabled`;
	}
	return message;
}