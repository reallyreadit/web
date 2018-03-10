import * as React from 'react';
import FormField from './FormField';
import InputControl, { Props } from './InputControl';
import * as classnames from 'classnames';

export default (props: Props & { className?: ClassValue }) => {
	const { className, ...inputControlProps } = props;
	return (
		<FormField
			label={props.label}
			className={classnames(props.className, 'input-field')}
		>
			<InputControl {...inputControlProps} />
		</FormField>
	)
};