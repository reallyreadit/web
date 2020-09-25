import * as React from 'react';
import { DeviceType, getStoreUrl } from '../../../common/DeviceType';

export default () => (
	<div className="store-links_gbmsih">
		<div className="title">Get Readup on all your devices</div>
		<div className="images">
			<a
				className="apple"
				href={getStoreUrl(DeviceType.Ios)} target="_blank"
			></a>
			<a
				className="chrome"
				href={getStoreUrl(DeviceType.DesktopChrome)} target="_blank"
			></a>
			<a
				className="firefox"
				href={getStoreUrl(DeviceType.DesktopFirefox)} target="_blank"
			></a>
			<a
				className="edge"
				href={getStoreUrl(DeviceType.DesktopEdge)} target="_blank"
			></a>
		</div>
	</div>
);