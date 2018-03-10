import * as React from 'react';
import * as className from 'classnames';

interface Props {
	label: string,
	children?: React.ReactNode,
	className?: ClassValue
}
const render: React.SFC<Props> = (props: Props) => (
	<label className={className('form-field', props.className)}>
		<strong>{props.label}</strong>
		<div className="field-container">
			{props.children}
		</div>
	</label>
);
export default render;