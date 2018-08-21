import * as React from 'react';
import InputField, { LabelPosition } from '../InputField';

export default (props: {
	autoFocus?: boolean,
	error: string,
	labelPosition?: LabelPosition,
	onChange: (value: string, error: string) => void,
	showError: boolean,
	value: string
}) => (
	<InputField
		autoFocus={props.autoFocus}
		error={props.error}
		label="Email Address"
		labelPosition={props.labelPosition}
		maxLength={256}
		onChange={props.onChange}
		required
		showError={props.showError}
		type="email"
		value={props.value}
	/>
);