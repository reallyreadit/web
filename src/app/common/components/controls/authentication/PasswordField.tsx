import * as React from 'react';
import InputField from '../InputField';

export default (props: {
	value: string,
	error: string,
	showError: boolean,
	onChange: (value: string, error: string) => void
}) => (
	<InputField
		type="password"
		label="Password"
		value={props.value}
		required
		error={props.error}
		showError={props.showError}
		onChange={props.onChange}
	/>
);