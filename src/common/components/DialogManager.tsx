import * as React from 'react';
import classNames from 'classnames';
import { DialogRenderer, DialogState } from '../services/DialogService';
import KeyValuePair from '../KeyValuePair';
import UserAccount from '../models/UserAccount';

interface Props {
	dialogs: KeyValuePair<number, DialogState>[],
	onGetDialogRenderer: (key: number) => DialogRenderer,
	onTransitionComplete: (key: number, transition: 'closing' | 'opening') => void,
	user: UserAccount | null,
	verticalAlignment?: 'auto' | 'top'
}
export default class DialogManager extends React.PureComponent<Props> {
	public static defaultProps: Partial<Props> = {
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
							this.props.verticalAlignment
						)
					}
				>
					{this.props.dialogs
						.filter(
							(_, index, dialogs) => dialogs
								.slice(0, index)
								.every(
									dialog => dialog.value.stage !== 'closing'
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
														dialog.value.stage !== 'closing'
													) ||
													(
														visibleDialogs.length === this.props.dialogs.length &&
														dialog.value.stage === 'closing'
													)
												),
												'closing': dialog.value.stage === 'closing',
												'obscured': (
													index < visibleDialogs.length - 1 &&
													visibleDialogs[visibleDialogs.length - 1].value.stage !== 'closing'
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
													'closing': dialog.value.stage === 'closing'
												}
											)
										}
										data-key={dialog.key}
										onAnimationEnd={this._handleAnimationEnd}
									>
										{this.props.onGetDialogRenderer(dialog.key)({ user: this.props.user })}
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