import SemanticVersion from '../../SemanticVersion';
import { AppPlatform } from '../../AppPlatform';

export default interface DeviceInfo {
	appPlatform: AppPlatform,
	appVersion: SemanticVersion,
	installationId: string | null,
	name: string,
	token: string | null
}