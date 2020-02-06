import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue
	}
) => (
	<div className={classNames('panel_zd0n2d', props.className)}>
		<div className="content">
			{props.children}
		</div>
	</div>
);