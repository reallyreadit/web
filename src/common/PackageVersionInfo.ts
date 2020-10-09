export default interface PackageVersionInfo {
	app: string,
	embed: string,
	extension: {
		package: string,
		contentParser: string
	},
	nativeClient: {
		reader: string,
		shareExtension: string
	}
}