import * as React from 'react';
import * as className from 'classnames';

export default (props: { dialog: React.ReactNode }) => (
	<div className={className('dialog-manager', { hidden: !props.dialog })}>
		{props.dialog}
	</div>
);