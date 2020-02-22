import * as React from 'react';
import Dialog from '../../../../../common/components/Dialog';
import GetStartedButton from '../GetStartedButton';
import { DeviceType } from '../../../DeviceType';

export default (
	props: {
		deviceType: DeviceType,
		onClose: () => void,
		onCopyAppReferrerTextToClipboard: () => void,
		onOpenNewPlatformNotificationRequestDialog: () => void,
		title?: string
	}
) => (
	<Dialog
		className="download-app-dialog_59deqy"
		onClose={props.onClose}
		title={props.title || 'Get the App'}
	>
		<GetStartedButton
			deviceType={props.deviceType}
			onCopyAppReferrerTextToClipboard={props.onCopyAppReferrerTextToClipboard}
			onOpenNewPlatformNotificationRequestDialog={props.onOpenNewPlatformNotificationRequestDialog}
		/>
	</Dialog>
);