import * as React from 'react';
import classNames from 'classnames';
import Icon, { IconName } from './Icon';
import Spinner from './Spinner';

export default class Button extends React.PureComponent<{
	text?: string,
	iconLeft?: IconName,
	style?: 'normal' | 'preferred',
	state?: 'normal' | 'disabled' | 'busy',
	showIndicator?: boolean,
	onClick?: () => void
}, {}> {
	private handleClick = () => {
		if (
			(this.props.state === 'normal' || this.props.state === undefined) &&
			this.props.onClick !== undefined
		) {
			this.props.onClick();
		}
	};
	public render() {
		const classList = {
			preferred: this.props.style === 'preferred',
			disabled: this.props.state === 'disabled' || this.props.state === 'busy',
			indicator: this.props.showIndicator
		};
		return (
			<button className={classNames('button_ovrlmi', classList)} onClick={this.handleClick}>
				{this.props.iconLeft ?
					<Icon name={this.props.iconLeft} /> :
					null}
				<span className="text">{this.props.text}</span>
				{this.props.state === 'busy' ?
					<span className="loading">
						<Spinner />
					</span> :
					null}
			</button>
		);
	}
} 