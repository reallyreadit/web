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
		error={props.error}
		label="Password"
		labelPosition={props.labelPosition}
		minLength={8}
		maxLength={256}
		onChange={props.onChange}
		required
		showError={props.showError}
		type="password"
		value={props.value}
	/>
);