import * as React from 'react';
import FormDialog from './FormDialog';

export default (
	props: {
		onClose: () => void
		onSubmit: () => Promise<void>
	}
) => (
	<FormDialog
		className="bookmark-dialog_esk9ow"
		closeButtonText="No"
		onClose={props.onClose}
		onSubmit={props.onSubmit}
		size="small"
		submitButtonText="Yes"
		textAlign="center"
		title="Bookmark"
	>
		<p>Want to pick up where you left off?</p>
	</FormDialog>
);