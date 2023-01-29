// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export type LabelPosition = 'horizontal' | 'vertical' | 'auto';
interface Props {
	label: string;
	children?: React.ReactNode;
	className?: ClassValue;
	labelPosition?: LabelPosition;
	subtext?: string;
}
const render: React.SFC<Props> = (props: Props) => (
	<div
		className={classNames('form-field_uv9cq4', props.className)}
		data-label-position={props.labelPosition}
	>
		<div className={classNames('control', props.labelPosition)}>
			<label>{props.label}</label>
			<div className="field-container">{props.children}</div>
		</div>
		{props.subtext ? <div className="subtext">{props.subtext}</div> : null}
	</div>
);
render.defaultProps = {
	labelPosition: 'auto',
};
export default render;
