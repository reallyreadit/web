import DeviceInfo from './DeviceInfo';

type SerializedDeviceInfo = Pick<DeviceInfo, Exclude<keyof DeviceInfo, 'appVersion'>> & {
	appVersion: string
}
export default SerializedDeviceInfo;