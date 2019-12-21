import * as React from 'react';

export default (
	props: {
		onCopyAppReferrerTextToClipboard: () => void
	}
) => (
	<a
		className="apple-download-button_p4jhwq"
		href="https://itunes.apple.com/us/app/reallyread-it/id1441825432"
		onClick={props.onCopyAppReferrerTextToClipboard}
	>
		<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
	</a>
);