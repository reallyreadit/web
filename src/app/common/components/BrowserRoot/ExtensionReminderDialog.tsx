import * as React from 'react';
import FormDialog from '../../../../common/components/FormDialog';
import { DeviceType } from '../../../../common/DeviceType';
import ExtensionButtonImage from './ExtensionButtonImage';

export default (
	props: {
		deviceType: DeviceType,
		onSubmit: () => Promise<void>
	}
) => (
	<FormDialog
		className="extension-reminder-dialog_i546dx"
		onSubmit={props.onSubmit}
		size="small"
		submitButtonText="Got it"
		textAlign="center"
		title="Don't Forget"
	>
		<p>Click the Readup button to turn on Reader-mode. Otherwise you won't get credit.</p>
		<ExtensionButtonImage deviceType={props.deviceType} />
	</FormDialog>
);