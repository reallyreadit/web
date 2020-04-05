import * as React from 'react';
import { DeviceType, getStoreUrl } from '../../../common/DeviceType';

export default () => (
	<div className="store-links_gbmsih">
		<div className="title">Get Readup on all your devices</div>
		<div className="images">
			<a href={getStoreUrl(DeviceType.Ios)} target="_blank"><img alt="Apple Logo" src="/images/apple.svg" /></a>
			<a href={getStoreUrl(DeviceType.DesktopChrome)} target="_blank"><img alt="Chrome Logo" src="/images/chrome.svg" /></a>
			<a href={getStoreUrl(DeviceType.DesktopFirefox)} target="_blank"><img alt="Firefox Logo" src="/images/firefox.svg" /></a>
		</div>
	</div>
);