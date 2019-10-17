import SemanticVersion from '../../SemanticVersion';

export default interface DeviceInfo {
	appVersion: SemanticVersion,
	installationId: string | null,
	name: string,
	token: string | null
}