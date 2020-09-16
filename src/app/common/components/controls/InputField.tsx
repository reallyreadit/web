import * as React from 'react';
import FormField , { LabelPosition } from './FormField';
import InputControl, { Props } from './InputControl';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export { LabelPosition };
export default (props: Props & {
	className?: ClassValue,
	labelPosition?: LabelPosition,
	subtext?: string
}) => {
	const { className, labelPosition, ...inputControlProps } = props;
	return (
		<FormField
			label={props.label}
			className={classNames(props.className, 'input-field')}
			labelPosition={props.labelPosition}
			subtext={props.subtext}
		>
			<InputControl {...inputControlProps} />
		</FormField>
	)
};