import * as React from 'react';
import InputField from '../InputField';

export default (props: {
	value: string,
	error: string,
	showError: boolean,
	onChange: (value: string, error: string) => void
}) => (
	<InputField
		type="email"
		label="Email Address"
		value={props.value}
		autoFocus
		required
		error={props.error}
		showError={props.showError}
		onChange={props.onChange}
	/>
);