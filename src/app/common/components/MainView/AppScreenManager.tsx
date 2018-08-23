import * as React from 'react';
import * as className from 'classnames';

export default (props: {
	screens: React.ReactNode[]
}) => (
	<div className={className(
		'app-screen-manager',
		{ 'hidden': !props.screens.length }
	)}>
		{props.screens}
	</div>
);