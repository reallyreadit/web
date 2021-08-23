import DeviceInfo from './DeviceInfo';
import { AppPlatform } from '../../AppPlatform';

type SerializedDeviceInfo = Pick<DeviceInfo, Exclude<keyof DeviceInfo, 'appPlatform' | 'appVersion'>> & {
	appPlatform?: AppPlatform,
	appVersion: string
}
export default SerializedDeviceInfo;