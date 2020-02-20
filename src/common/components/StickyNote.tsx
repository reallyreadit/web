import * as React from 'react';
import { ClassValue } from 'classnames/types';
import classNames = require('classnames');

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue
	}
) => (
	<span className={classNames('sticky-note_zcw6jg', props.className)}>{props.children}</span>
);