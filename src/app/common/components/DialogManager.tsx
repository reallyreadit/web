import * as React from 'react';
import classNames from 'classnames';

interface Props {
	dialog: React.ReactNode,
	isClosing: boolean,
	onRemove: () => void
}
export default class DialogManager extends React.PureComponent<Props> {
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'dialog-manager_51j1qt-overlay-fade-out') {
			this.props.onRemove();
		}
	};
	public render() {
		return (
			<div
				className={
					classNames(
						'dialog-manager_51j1qt',
						{
							closing: this.props.isClosing
						}
					)
				}
				onAnimationEnd={this._handleAnimationEnd}
			>
				{this.props.dialog}
			</div>
		);
	}
}