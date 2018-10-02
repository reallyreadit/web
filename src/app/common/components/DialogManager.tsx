import * as React from 'react';
import classNames from 'classnames';

export default (props: { dialog: React.ReactNode }) => (
	<div className={classNames('dialog-manager', { hidden: !props.dialog })}>
		{props.dialog}
	</div>
);