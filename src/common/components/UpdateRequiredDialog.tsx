import * as React from 'react';
import FormDialog from './FormDialog';

export default (
	props: {
		message?: string,
		onClose: () => void,
		updateType: 'app' | 'ios',
		versionRequired: string
	}
) => (
	<FormDialog
		className="update-required-dialog_v6ptk5"
		closeButtonText="Dismiss"
		onClose={props.onClose}
		size="small"
		textAlign="center"
		title={
			props.updateType === 'app' ?
				'App Update Required' :
				'iOS Update Required'
		}
	>
		{props.updateType === 'app' ?
			<p>Readup must be updated in the App Store to version {props.versionRequired} or greater to use this feature.</p> :
			<p>iOS {props.versionRequired} or greater is required to use this feature.</p>}
		{props.message ?
			<p>{props.message}</p> :
			null}
	</FormDialog>
);