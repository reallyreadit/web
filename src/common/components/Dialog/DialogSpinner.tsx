import * as React from 'react';
import Spinner from '../Spinner';

interface Props {
	message: string
}
const DialogSpinner = (props: Props) => (
	<div className="dialog-spinner_xikxn5">
		<div className="message">{props.message}</div>
		<Spinner />
	</div>
);
export default DialogSpinner;