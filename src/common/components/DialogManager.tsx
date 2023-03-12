// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import classNames from 'classnames';
import { DialogRenderer, DialogState } from '../services/DialogService';
import KeyValuePair from '../KeyValuePair';

interface Props<SharedState> {
	dialogs: KeyValuePair<number, DialogState>[];
	onGetDialogRenderer: (key: number) => DialogRenderer<SharedState>;
	onTransitionComplete: (
		key: number,
		transition: 'closing' | 'opening'
	) => void;
	sharedState: SharedState;
	verticalAlignment?: 'auto' | 'top';
}
export default class DialogManager<SharedState> extends React.Component<
	Props<SharedState>
> {
	public static defaultProps: Pick<Props<unknown>, 'verticalAlignment'> = {
		verticalAlignment: 'auto',
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName) {
			const key = parseInt((event.currentTarget as HTMLElement).dataset['key']);
			if (
				event.animationName.startsWith('dialog-manager_b1yvhp-dialog-slide-in')
			) {
				this.props.onTransitionComplete(key, 'opening');
			}
			if (
				event.animationName.startsWith('dialog-manager_b1yvhp-dialog-slide-out')
			) {
				this.props.onTransitionComplete(key, 'closing');
			}
		}
	};
	public render() {
		if (this.props.dialogs.length) {
			return (
				<ol
					className={classNames(
						'dialog-manager_b1yvhp',
						this.props.verticalAlignment
					)}
				>
					{this.props.dialogs
						.filter((_, index, dialogs) =>
							dialogs
								.slice(0, index)
								.every((dialog) => dialog.value.stage !== 'closing')
						)
						.map((dialog, index, visibleDialogs) => (
							<li
								className={classNames('overlay', {
									animated:
										index !== 0 ||
										(dialog.key === 0 && dialog.value.stage !== 'closing') ||
										(visibleDialogs.length === this.props.dialogs.length &&
											dialog.value.stage === 'closing'),
									closing: dialog.value.stage === 'closing',
									obscured:
										index < visibleDialogs.length - 1 &&
										visibleDialogs[visibleDialogs.length - 1].value.stage !==
											'closing',
								})}
								key={dialog.key}
							>
								<div
									className={classNames('container', {
										closing: dialog.value.stage === 'closing',
									})}
									data-key={dialog.key}
									onAnimationEnd={this._handleAnimationEnd}
								>
									{this.props.onGetDialogRenderer(dialog.key)(
										this.props.sharedState
									)}
								</div>
							</li>
						))}
				</ol>
			);
		}
		return null;
	}
}
