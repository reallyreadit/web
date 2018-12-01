import * as React from 'react';
import Icon, { IconName } from '../../../../common/components/Icon';
import classNames from 'classnames';

export default (props: {
	children: React.ReactNode,
	icon?: IconName,
	position: 'absolute' | 'static',
	style: 'normal' | 'warning'
}) => (
	<div className={classNames(
		'info-box_whou0t',
		{
			'absolute': props.position === 'absolute',
			'warning': props.style === 'warning'
		}
	)}>
		<div className="box">
			{props.icon ?
				<div className="icon-container">
					<Icon name={props.icon} />
				</div> :
				null}
			<div className="content">
				{props.children}
			</div>
		</div>
	</div>
);