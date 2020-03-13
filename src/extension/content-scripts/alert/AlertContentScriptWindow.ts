interface AlertContentScriptWindow {
	alertContent: string,
	display?: () => void,
	isActive?: boolean
}