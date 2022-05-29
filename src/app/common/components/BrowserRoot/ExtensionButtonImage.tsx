// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import { DeviceType } from '../../../../common/DeviceType';

export default (
	props: {
		deviceType: DeviceType,
		onCreateStaticContentUrl: (path: string) => string
	}
) => {
	let imgUrl = props.onCreateStaticContentUrl('/app/images/');
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