import * as React from 'react';
import { ClassValue } from 'classnames/types';
import classNames = require('classnames');

const StickyNote = (
	props: {
		type?: 'straight' | 'inclined';
		children: React.ReactNode,
		className?: ClassValue
	}
) => (
	<span className={classNames('sticky-note_zcw6jg', {'type--straight': props.type === 'straight' }, props.className)}>{props.children}</span>
);

StickyNote.defaultProps = {
	type: 'inclined'
};

export default StickyNote;