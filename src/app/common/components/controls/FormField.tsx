import * as React from 'react';
import classNames, { ClassValue } from 'classnames';

export type LabelPosition = 'horizontal' | 'vertical' | 'auto';
interface Props {
	label: string,
	children?: React.ReactNode,
	className?: ClassValue,
	labelPosition?: LabelPosition
}
const render: React.SFC<Props> = (props: Props) => (
	<label
		className={classNames('form-field', props.className)}
		data-label-position={props.labelPosition}
	>
		<strong>{props.label}</strong>
		<div className="field-container">
			{props.children}
		</div>
	</label>
);
render.defaultProps = {
	labelPosition: 'auto'
};
export default render;