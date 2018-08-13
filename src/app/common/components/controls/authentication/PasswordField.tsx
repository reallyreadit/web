import * as React from 'react';
import InputField, { LabelPosition } from '../InputField';

export default (props: {
	error: string,
	labelPosition?: LabelPosition,
	onChange: (value: string, error: string) => void,
	showError: boolean,
	value: string
}) => (
	<InputField
		type="password"
		label="Password"
		labelPosition={props.labelPosition}
		value={props.value}
		required
		error={props.error}
		showError={props.showError}
		onChange={props.onChange}
	/>
);