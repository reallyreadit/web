import * as React from 'react';
import classNames = require('classnames');

interface Props {
	children: React.ReactNode,
	href?: string,
	onClick: () => void,
	style?: 'loud' | 'normal'
}
export default class extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
		style: 'normal'
	};
	private readonly _handleAnchorClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onClick();
	};
	public render() {
		const className = classNames('browser-button', this.props.style);
		if (this.props.href) {
			return (
				<a
					className={className}
					href={this.props.href}
					onClick={this._handleAnchorClick}
				>
					{this.props.children}
				</a>
			);
		}
		return (
			<button
				className={className}
				onClick={this.props.onClick}
			>
				{this.props.children}
			</button>
		);
	}
}