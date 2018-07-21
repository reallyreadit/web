import * as React from 'react';
import Icon from './Icon';

export default (props: { readCount: number }) => (
	<div className="read-count-indicator">
		<Icon name="book" />
		{props.readCount + ' ' + (props.readCount === 1 ? 'read' : 'reads')}
	</div>
);