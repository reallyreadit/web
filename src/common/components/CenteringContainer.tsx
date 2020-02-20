import * as React from 'react';
import { ClassValue } from 'classnames/types';
import * as classNames from 'classnames';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue
	}
) => (
	<div className={classNames('centering-container_e32hih', props.className)}>
		{props.children}
	</div>
);