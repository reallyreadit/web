import * as React from 'react';
import Dialog from '../../../../../common/components/Dialog';

export default (
	props: {
		onCopyAppReferrerTextToClipboard: () => void,
		onClose: () => void,
		title?: string
	}
) => (
	<Dialog
		className="download-ios-app-dialog_i96v9f"
		onClose={props.onClose}
		title={props.title || 'Get the App'}
	>
		<a
			className="download-app-button"
			href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
			onClick={props.onCopyAppReferrerTextToClipboard}
		>
			<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
		</a>
	</Dialog>
);