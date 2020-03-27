import * as React from 'react';
import ActionLink from '../../../../common/components/ActionLink';
import { DeviceType } from '../../../../common/DeviceType';

function renderAppleAppStoreButton(onCopyAppReferrerTextToClipboard: () => void) {
	return (
		<a
			className="ios"
			href="https://apps.apple.com/us/app/readup-app/id1441825432"
			onClick={onCopyAppReferrerTextToClipboard}
		>
			<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
		</a>
	);
}
function renderChromeWebStoreButton() {
	return (
		<a
			className="chrome"
			href="https://chrome.google.com/webstore/detail/reallyreadit/mkeiglkfdfamdjehidenkklibndmljfi"
			target="_blank"
		>
			<img src="/images/ChromeWebStore_BadgeWBorder.svg" alt="Chrome Web Store Badge" />
		</a>
	);
}
export default (
	props: {
		deviceType: DeviceType,
		onCopyAppReferrerTextToClipboard: () => void,
		onOpenNewPlatformNotificationRequestDialog: () => void
	}
) => (
	<div className="get-started-button_z950ea">
		<div className="buttons">
			{renderAppleAppStoreButton(props.onCopyAppReferrerTextToClipboard)}
			{props.deviceType !== DeviceType.Ios ?
				renderChromeWebStoreButton() :
				null}
		</div>
		{props.deviceType === DeviceType.DesktopChrome ?
				<span>Coming soon to Android. <ActionLink onClick={props.onOpenNewPlatformNotificationRequestDialog} text="Get notified." /></span> :
				props.deviceType !== DeviceType.Ios ?
					<span>Coming soon to Android, Firefox, Safari and Edge. <ActionLink onClick={props.onOpenNewPlatformNotificationRequestDialog} text="Get notified." /></span> :
					null}
	</div>
)