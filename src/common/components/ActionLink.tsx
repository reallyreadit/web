import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import Icon, { IconName } from './Icon';
import SpinnerIcon from './SpinnerIcon';
import AlertBadge from './AlertBadge';

export default class extends React.PureComponent<{
	badge?: number,
	className?: ClassValue,
	href?: string,
	iconLeft?: IconName,
	onAnimationEnd?: (event: React.AnimationEvent) => void,
	onClick?: (e: React.MouseEvent<HTMLElement>, href?: string) => void,
	state?: 'normal' | 'disabled' | 'busy',
	text: string,
}, {}> {
	private _handleClick = (e: React.MouseEvent<HTMLElement>) => {
		if ((this.props.state === 'normal' || !this.props.state) && !!this.props.onClick) {
			e.preventDefault();
			this.props.onClick(e, this.props.href);
		}
	};
	public render() {
		const
			cssClass = classNames(
				'action-link_ftamt8',
				this.props.className,
				{
					disabled: this.props.state === 'disabled',
					busy: this.props.state === 'busy'
				}
			),
			content = (
				<>
					{this.props.state === 'busy' ?
						<SpinnerIcon key="spinner" /> :
						this.props.iconLeft ?
							<Icon
								badge={this.props.badge}
								key="icon"
								name={this.props.iconLeft}
							/> :
							null}
					<span key="text">{this.props.text}</span>
					{this.props.badge != null ?
						<AlertBadge count={this.props.badge} /> :
						null}
				</>
			);
		return (
			this.props.href ?
				<a
					onAnimationEnd={this.props.onAnimationEnd}
					className={cssClass}
					href={this.props.href}
					onClick={this._handleClick}
				>
					{content}
				</a> :
				<span
					onAnimationEnd={this.props.onAnimationEnd}
					className={cssClass}
					onClick={this._handleClick}
				>
					{content}
				</span>
		);
	}
} 