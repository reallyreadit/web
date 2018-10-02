import * as React from 'react';
import FormField , { LabelPosition } from './FormField';
import InputControl, { Props } from './InputControl';
import classNames, { ClassValue } from 'classnames';

export { LabelPosition };
export default (props: Props & {
	className?: ClassValue,
	labelPosition?: LabelPosition
}) => {
	const { className, labelPosition, ...inputControlProps } = props;
	return (
		<FormField
			label={props.label}
			className={classNames(props.className, 'input-field')}
			labelPosition={props.labelPosition}
		>
			<InputControl {...inputControlProps} />
		</FormField>
	)
};