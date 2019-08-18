import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import Icon from '../../../../common/components/Icon';

export default (
	props: {
		children: React.ReactNode,
		className?: ClassValue,
		onClose?: () => void,
		size?: 'small',
		title: string
	}
) => (
	<div className={classNames('dialog_k09mus', props.className, { 'small': props.size === 'small' })}>
		<div className="header">
			<div className="title">{props.title}</div>
			{props.onClose ?
				<Icon
					className="close"
					name="cancel"
					onClick={props.onClose}
				/> :
				null}
		</div>
		{props.children}
	</div>
);