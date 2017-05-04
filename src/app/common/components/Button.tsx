import * as React from 'react';
import * as className from 'classnames';

export default class Button extends React.PureComponent<{
	text: string,
	iconLeft?: string,
	style?: 'normal' | 'preferred',
	state?: 'normal' | 'disabled' | 'busy',
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
			busy: this.props.state === 'busy'
		};
		return (
			<button className={className('button', classList)} onClick={this.handleClick}>
				<div className="outer-wrap">
					<div className="inner-wrap">
						<div className="content">
							{this.props.iconLeft ?
								<span className={className('icon-wrapper', { 'indicator': this.props.showIndicator })}><svg className="icon"><use xlinkHref={`#icon-${this.props.iconLeft}`}></use></svg></span> :
								null}
							<span className={className('text', { 'error': this.props.textStyle === 'error' })}>{this.props.text}</span>
							<div className="loading"></div>
						</div>
					</div>
				</div>
			</button>
		);
	}
} 