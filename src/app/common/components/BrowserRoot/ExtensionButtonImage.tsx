import * as React from 'react';
import { DeviceType } from '../../../../common/DeviceType';

export default (
	props: {
		deviceType: DeviceType
	}
) => {
	let imgUrl = '/images/';
	if (props.deviceType === DeviceType.DesktopFirefox) {
		imgUrl += 'bai-screenshot-firefox.png';
	} else if (props.deviceType === DeviceType.DesktopSafari) {
		imgUrl += 'bai-screenshot-safari.png';
	} else {
		imgUrl += 'bai-screenshot-chrome.png';
	}
	return (
		<img
			alt="Readup Extension Button"
			className="extension-button-image_dr3we4"
			src={imgUrl}
		/>
	);
};