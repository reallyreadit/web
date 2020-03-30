import * as React from 'react';
import Dialog from '../../../../common/components/Dialog';
import { DeviceType } from '../../../../common/DeviceType';

export default (
	props: {
		deviceType: DeviceType,
		onSubmit: () => Promise<void>
	}
) => {
	let imgUrl = '/images/';
	if (props.deviceType === DeviceType.DesktopFirefox) {
		imgUrl += 'bai-screenshot-firefox.png';
	} else {
		imgUrl += 'bai-screenshot-chrome.png';
	}
	return (
		<Dialog
			className="extension-reminder-dialog_i546dx"
			onSubmit={props.onSubmit}
			size="small"
			submitButtonText="Got it"
			textAlign="center"
			title="Don't Forget"
		>
			<p>Click the Readup button to turn on Reader-mode. Otherwise you won't get credit.</p>
			<img src={imgUrl} alt="Readup Extension Button" />
		</Dialog>
	);
}