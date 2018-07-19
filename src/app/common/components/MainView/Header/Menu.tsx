import * as React from 'react';
import Icon from '../../../../../common/components/Icon';
import * as className from 'classnames';

export default class extends React.Component<{
	buttonContent: React.ReactNode,
	menuContent: React.ReactNode,
	className?: ClassValue
}, {
	isFocusing: boolean
}> {
	private _menuRef: HTMLDivElement;
	private readonly _setMenuRef = (ref: HTMLDivElement) => {
		this._menuRef = ref;
	};
	private readonly _handleMouseDown = () => {
		if (this._menuRef !== document.activeElement) {
			this.setState({ isFocusing: true });
		}
	};
	private readonly _handleClick = () => {
		if (this.state.isFocusing) {
			this.setState({ isFocusing: false });
		} else {
			this._menuRef.blur();
		}
	};
	public render() {
		return (
			<div
				className={className('menu', this.props.className)}
				tabIndex={-1}
				ref={this._setMenuRef}
				onMouseDown={this._handleMouseDown}
				onClick={this._handleClick}
			>
				{this.props.buttonContent}
				<Icon name="chevron-down" className="closed" />
				<Icon name="chevron-up" className="opened" />
				<ol>
					{this.props.menuContent}
				</ol>
			</div>
		);
	}
}