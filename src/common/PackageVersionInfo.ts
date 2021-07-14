export default interface PackageVersionInfo {
	app: string,
	appPublic: string,
	common: {
		contentParser: string,
		metadataParser: string
	},
	embed: string,
	embedIframe: string,
	extension: string,
	nativeClient: {
		reader: string,
		shareExtension: string
	}
}