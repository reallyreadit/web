import * as React from 'react';
import * as className from 'classnames';

export default class Button extends React.PureComponent<{
	style?: 'normal' | 'preferred',
	state?: 'normal' | 'disabled' | 'busy'
	onClick?: () => void
}, {}> {
	private handleClick = () => this.props.state === 'normal' || this.props.state === undefined ?
		this.props.onClick() : undefined;
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
							<span className="text">{this.props.children}</span>
							<div className="loading"></div>
						</div>
					</div>
				</div>
			</button>
		);
	}
} 