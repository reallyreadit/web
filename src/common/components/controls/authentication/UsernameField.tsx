import * as React from 'react';
import InputField, { LabelPosition } from '../InputField';

export default (props: {
	autoFocus?: boolean,
	error: string,
	labelPosition?: LabelPosition,
	onChange: (value: string, error?: string) => void,
	onEnterKeyPressed?: () => void,
	showError: boolean,
	value: string
}) => (
		<InputField
			autoCapitalize="none"
			autoFocus={props.autoFocus}
			error={props.error}
			label="Reader Name"
			labelPosition={props.labelPosition}
			minLength={3}
			maxLength={30}
			onChange={props.onChange}
			onEnterKeyPressed={props.onEnterKeyPressed}
			required
			showError={props.showError}
			subtext="Your reader name will be public, but you can choose to be as anonymous as you wish. (ex: JenFox or Human123)"
			type="username"
			value={props.value}
		/>
	);