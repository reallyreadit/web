import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import Menu from './Popover/Menu';

export enum MenuPosition {
	TopLeft = 'top/left',
	TopCenter = 'top/center',
	TopRight = 'top/right',
	RightTop = 'right/top',
	RightMiddle = 'right/middle',
	RightBottom = 'right/bottom',
	BottomLeft = 'bottom/left',
	BottomCenter = 'bottom/center',
	BottomRight = 'bottom/right',
	LeftTop = 'left/top',
	LeftMiddle = 'left/middle',
	LeftBottom = 'left/bottom'
}
export enum MenuState {
	Closed,
	Closing,
	Opened
}
interface Props {
	children: React.ReactNode,
	className?: ClassValue,
	menuChildren: React.ReactNode,
	menuPosition: MenuPosition,
	menuState: MenuState,
	onBeginClosing: () => void,
	onClose: () => void,
	onOpen: (event: React.MouseEvent<HTMLElement>) => void
}
export default class Popover extends React.PureComponent<Props> {
	private _childElementWillReceiveFocus = false;
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName.startsWith('menu_qla37i-pop-out')) {
			this.props.onClose();
		}
	};
	private readonly _handleBlur = () => {
		if (!this._childElementWillReceiveFocus) {
			if (this.props.menuState === MenuState.Opened) {
				this.props.onBeginClosing();
			}
		} else {
			this._childElementWillReceiveFocus = false;
		}
	};
	private readonly _handleChildrenClick = (event: React.MouseEvent<HTMLElement>) => {
		if (this.props.menuState === MenuState.Opened) {
			this.props.onBeginClosing();
		} else {
			this.props.onOpen(event);
		}
	};
	private readonly _registerImpendingChildFocusTransition = () => {
		this._childElementWillReceiveFocus = true;
	};
	public render() {
		return (
			<span
				className={classNames('popover_r7v81v', this.props.className)}
				onAnimationEnd={this._handleAnimationEnd}
				onBlur={this._handleBlur}
				tabIndex={-1}
			>
				<span
					className="children"
					onClick={this._handleChildrenClick}
				>
					{this.props.children}
				</span>
				{this.props.menuState !== MenuState.Closed ?
					<Menu
						isClosing={this.props.menuState === MenuState.Closing}
						onMouseDown={this._registerImpendingChildFocusTransition}
						position={this.props.menuPosition}
					>
						{this.props.menuChildren}
					</Menu>:
					null}
			</span>
		);
	}
}