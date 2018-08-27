import * as React from 'react';
import * as className from 'classnames';
import Icon, { IconName } from './Icon';
import Spinner from './Spinner';

export default class ActionLink extends React.PureComponent<{
	text: string,
	iconLeft?: IconName,
	state?: 'normal' | 'disabled' | 'busy',
	onClick?: () => void
}, {}> {
	private _handleClick = () => {
		if ((this.props.state === 'normal' || !this.props.state) && !!this.props.onClick) {
			this.props.onClick();
		}
	};
	public render() {
		const classList = {
			disabled: this.props.state === 'disabled' || this.props.state === 'busy',
			busy: this.props.state === 'busy'
		}
		return (
			<span className={className('action-link', classList)} onClick={this._handleClick}>
				{this.props.state === 'busy' ?
					<Spinner /> :
					this.props.iconLeft ?
						<Icon name={this.props.iconLeft} /> :
						null}
				<span>{this.props.text}</span>
			</span>
		);
	}
} 