import * as React from 'react';
import classNames from 'classnames';

export default (props: { dialog: React.ReactNode }) => (
	<div className={classNames('dialog-manager_51j1qt', { hidden: !props.dialog })}>
		{props.dialog}
	</div>
);