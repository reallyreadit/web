import * as React from 'react';
import Icon, { IconName } from '../../../../common/components/Icon';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';

export default (props: {
	children: React.ReactNode,
	className?: ClassValue,
	icon?: IconName,
	position: 'absolute' | 'static',
	style: 'normal' | 'warning' | 'success'
}) => (
	<div className={
		classNames(
			'info-box_whou0t',
			props.className,
			{
				'absolute': props.position === 'absolute',
				'success': props.style === 'success',
				'warning': props.style === 'warning'
			}
		)
	}>
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