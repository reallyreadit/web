import * as React from 'react';
import classNames from 'classnames';

interface Props {
	dialog: React.ReactNode,
	isClosing: boolean,
	onRemove: () => void,
	style?: 'light' | 'dark',
	verticalAlignment?: 'auto' | 'top'
}
export default class DialogManager extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
		style: 'dark',
		verticalAlignment: 'auto'
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName && event.animationName.startsWith('dialog-manager_b1yvhp-overlay-fade-out')) {
			this.props.onRemove();
		}
	};
	public render() {
		return (
			<div
				className={
					classNames(
						'dialog-manager_b1yvhp',
						this.props.style,
						this.props.verticalAlignment,
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