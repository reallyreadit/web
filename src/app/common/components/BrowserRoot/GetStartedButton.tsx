import * as React from 'react';
import ActionLink from '../../../../common/components/ActionLink';

export default (
	props: {
		isIosDevice: boolean,
		onCopyAppReferrerTextToClipboard: () => void,
		onOpenNewPlatformNotificationRequestDialog: () => void
	}
) => (
	<div className="get-started-button_z950ea">
		<a
			href="https://apps.apple.com/us/app/readup-app/id1441825432"
			onClick={props.onCopyAppReferrerTextToClipboard}
		>
			<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
		</a>
		{!props.isIosDevice ?
			<span>Coming soon to Windows, macOS and Android. <ActionLink onClick={props.onOpenNewPlatformNotificationRequestDialog} text="Get notified." /></span> :
			null}
	</div>
)