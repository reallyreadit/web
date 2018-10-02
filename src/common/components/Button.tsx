import * as React from 'react';
import classNames from 'classnames';
import Icon, { IconName } from './Icon';

export default class Button extends React.PureComponent<{
	text: string,
	iconLeft?: IconName,
	contentLeft?: React.ReactNode,
	style?: 'normal' | 'preferred',
	state?: 'normal' | 'active' | 'disabled' | 'busy',
	showIndicator?: boolean,
	textStyle?: 'normal' | 'error'
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
			busy: this.props.state === 'busy',
			active: this.props.state === 'active'
		};
		return (
			<button className={classNames('button', classList)} onClick={this.handleClick}>
				<div className="outer-wrap">
					<div className="inner-wrap">
						<div className="content">
							{this.props.iconLeft ?
								<span className={classNames('icon-wrapper', { 'indicator': this.props.showIndicator })}><Icon name={this.props.iconLeft} /></span> :
								null}
							{this.props.contentLeft ?
								<div className="content-left">{this.props.contentLeft}</div> :
								null}
							<span className={classNames('text', { 'error': this.props.textStyle === 'error' })}>{this.props.text}</span>
							<div className="loading"></div>
						</div>
					</div>
				</div>
			</button>
		);
	}
} 