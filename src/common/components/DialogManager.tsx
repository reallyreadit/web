import * as React from 'react';
import classNames from 'classnames';
import { Dialog } from '../services/DialogService';

interface Props {
	dialogs: Dialog[],
	onTransitionComplete: (key: number, transition: 'closing' | 'opening') => void,
	style?: 'light' | 'dark',
	verticalAlignment?: 'auto' | 'top'
}
export default class DialogManager extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
		style: 'dark',
		verticalAlignment: 'auto'
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName) {
			const key = parseInt((event.currentTarget as HTMLElement).dataset['key']);
			if (event.animationName.startsWith('dialog-manager_b1yvhp-dialog-slide-in')) {
				this.props.onTransitionComplete(key, 'opening');
			}
			if (event.animationName.startsWith('dialog-manager_b1yvhp-dialog-slide-out')) {
				this.props.onTransitionComplete(key, 'closing');
			}
		}
	};
	public render() {
		if (this.props.dialogs.length) {
			return (
				<ol
					className={
						classNames(
							'dialog-manager_b1yvhp',
							this.props.style,
							this.props.verticalAlignment
						)
					}
				>
					{this.props.dialogs
						.filter(
							(_, index, dialogs) => dialogs
								.slice(0, index)
								.every(
									dialog => dialog.state !== 'closing'
								)
						)
						.map(
							(dialog, index, visibleDialogs) => (
								<li
									className={
										classNames(
											'overlay',
											{
												'animated': (
													index !== 0 ||
													(
														dialog.key === 0 &&
														dialog.state !== 'closing'
													) ||
													(
														visibleDialogs.length === this.props.dialogs.length &&
														dialog.state === 'closing'
													)
												),
												'closing': dialog.state === 'closing',
												'obscured': (
													index < visibleDialogs.length - 1 &&
													visibleDialogs[visibleDialogs.length - 1].state !== 'closing'
												)
											}
										)
									}
									key={dialog.key}
								>
									<div
										className={
											classNames(
												'container',
												{
													'closing': dialog.state === 'closing'
												}
											)
										}
										data-key={dialog.key}
										onAnimationEnd={this._handleAnimationEnd}
									>
										{dialog.element}
									</div>
								</li>
							)
						)}
				</ol>
			);
		}
		return null;
	}
}