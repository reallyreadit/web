import SemanticVersion from '../../common/SemanticVersion';

export type ExtensionInstalledEvent = {
	type: 'installed',
	version: SemanticVersion
};
export type ExtensionUninstalledEvent = {
	type: 'uninstalled'
};
type ExtensionInstallationEvent = ExtensionInstalledEvent | ExtensionUninstalledEvent;
export default ExtensionInstallationEvent;