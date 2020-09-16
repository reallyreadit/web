import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export type LabelPosition = 'horizontal' | 'vertical' | 'auto';
interface Props {
	label: string,
	children?: React.ReactNode,
	className?: ClassValue,
	labelPosition?: LabelPosition,
	subtext?: string
}
const render: React.SFC<Props> = (props: Props) => (
	<div
		className={classNames('form-field_8ey399', props.className)}
		data-label-position={props.labelPosition}
	>
		<div
			className={
				classNames('control', props.labelPosition)
			}
		>
			<label>{props.label}</label>
			<div className="field-container">
				{props.children}
			</div>
		</div>
		{props.subtext ?
			<div className="subtext">{props.subtext}</div> :
			null}
	</div>
);
render.defaultProps = {
	labelPosition: 'auto'
};
export default render;