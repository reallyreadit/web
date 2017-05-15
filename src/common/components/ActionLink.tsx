import * as React from 'react';
import * as className from 'classnames';

export default class ActionLink extends React.PureComponent<{
	text: string,
	iconLeft?: string,
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
				<svg className="icon"><use xlinkHref={`#icon-${this.props.state === 'busy' ? 'spinner' : this.props.iconLeft}`}></use></svg>
				<span>{this.props.text}</span>
			</span>
		);
	}
} 