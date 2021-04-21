import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import Icon, { IconName } from './Icon';
import SpinnerIcon from './SpinnerIcon';
import AlertBadge from './AlertBadge';

type BaseProps = {
	badge?: number,
	className?: ClassValue,
	href?: string,
	iconLeft?: IconName,
	iconRight?: IconName,
	onAnimationEnd?: (event: React.AnimationEvent) => void,
	onClick?: (e: React.MouseEvent<HTMLElement>, href?: string) => void,
	state?: 'normal' | 'disabled' | 'busy'
};
type AttrContentProps = BaseProps & {
	text: string
};
type ChildContentProps = BaseProps & {
	children: string
};

export default class extends React.Component<AttrContentProps | ChildContentProps> {
	private _handleClick = (e: React.MouseEvent<HTMLElement>) => {
		if (this.props.onClick) {
			e.preventDefault();
		}
		if (this.props.state === 'normal' || !this.props.state) {
			this.props.onClick(e, this.props.href);
		}
	};
	public render() {
		const
			cssClass = classNames(
				'link_ke15oa',
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
								className="icon-left"
								badge={this.props.badge}
								key="icon-left"
								name={this.props.iconLeft}
							/> :
							null}
					<span key="text">{(this.props as AttrContentProps).text ?? (this.props as ChildContentProps).children}</span>
					{this.props.iconRight ?
						<Icon
							className="icon-right"
							badge={this.props.badge}
							key="icon-right"
							name={this.props.iconRight}
						/> :
						null}
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