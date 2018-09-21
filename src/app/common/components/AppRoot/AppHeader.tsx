import * as React from 'react';

export default (props: {
	onBack: () => void,
	title: string | null
}) => (
	props.title ?
	(
		<div className="app-header">
			{props.title}
		</div>
	) :
	null
);