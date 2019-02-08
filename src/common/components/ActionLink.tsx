import * as React from 'react';
import classNames from 'classnames';
import Icon, { IconName } from './Icon';
import Spinner from './Spinner';

export default class extends React.PureComponent<{
	href?: string,
	iconLeft?: IconName,
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
				{
					disabled: this.props.state === 'disabled' || this.props.state === 'busy',
					busy: this.props.state === 'busy'
				}
			),
			content = [
				this.props.state === 'busy' ?
					<Spinner key="spinner" /> :
					this.props.iconLeft ?
						<Icon
							key="icon"
							name={this.props.iconLeft}
						/> :
						null,
				<span key="text">{this.props.text}</span>
			];
		return (
			this.props.href ?
				<a
					className={cssClass}
					href={this.props.href}
					onClick={this._handleClick}
				>
					{content}
				</a> :
				<span
					className={cssClass}
					onClick={this._handleClick}
				>
					{content}
				</span>
		);
	}
} 