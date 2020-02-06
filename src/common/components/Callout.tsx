import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (
	props: {
		className?: ClassValue,
		children: React.ReactNode
	}
) => (
	<span className={classNames('callout_k8z57c', props.className)}>
		<span className="ellipse"></span>
		<span className="arrow"></span>
		<span className="note">{props.children}</span>
	</span>
);