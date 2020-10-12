import * as React from 'react';
import InputField, { LabelPosition } from '../InputField';

export default (props: {
	autoFocus?: boolean,
	error: string,
	labelPosition?: LabelPosition,
	onChange: (value: string, error: string) => void,
	onEnterKeyPressed?: () => void,
	showError: boolean,
	value: string
}) => (
	<InputField
		autoFocus={props.autoFocus}
		error={props.error}
		label="Email"
		labelPosition={props.labelPosition}
		maxLength={256}
		onChange={props.onChange}
		onEnterKeyPressed={props.onEnterKeyPressed}
		required
		showError={props.showError}
		type="email"
		value={props.value}
	/>
);