import * as React from 'react';
import Button from '../../../../common/components/Button';

export default (
	props: {
		isIosDevice: boolean | null,
		onCopyAppReferrerTextToClipboard: () => void,
		onOpenCreateAccountDialog: () => void
	}
) => {
	let button: JSX.Element = null;
	if (props.isIosDevice) {
		button = (
			<a
				className="get-started-button_z950ea ios"
				href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
				onClick={props.onCopyAppReferrerTextToClipboard}
			>
				<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
			</a>
		);
	} else if (props.isIosDevice === false) {
		button = (
			<Button
				className="get-started-button_z950ea"
				size="x-large"
				intent="loud"
				text="Get Started"
				onClick={props.onOpenCreateAccountDialog}
			/>
		);
	}
	return button;
}