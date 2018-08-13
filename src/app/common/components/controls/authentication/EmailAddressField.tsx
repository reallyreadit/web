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
		type="email"
		label="Email Address"
		labelPosition={props.labelPosition}
		value={props.value}
		autoFocus
		required
		error={props.error}
		showError={props.showError}
		onChange={props.onChange}
	/>
);