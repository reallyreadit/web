export default interface PackageVersionInfo {
	app: string,
	appPublic: string,
	embed: string,
	embedIframe: string,
	extension: {
		package: string,
		contentParser: string
	},
	nativeClient: {
		reader: string,
		shareExtension: string
	}
}