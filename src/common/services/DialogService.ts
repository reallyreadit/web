// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import KeyValuePair from '../KeyValuePair';

export interface DialogState {
	stage: 'opening' | 'opened' | 'closing';
}
export interface DialogServiceState {
	dialogs: KeyValuePair<number, DialogState>[];
}
type StateChangeDelegate = (
	state: (
		prevState: DialogServiceState
	) => Pick<DialogServiceState, keyof DialogServiceState>,
	callback?: () => void
) => void;
export type DialogRenderer<SharedState> = (
	sharedState: SharedState
) => React.ReactNode;
export default class DialogService<SharedState> {
	private _key = 0;
	private readonly _renderers: KeyValuePair<
		number,
		DialogRenderer<SharedState>
	>[] = [];
	private readonly _setState: StateChangeDelegate;
	constructor({
		setState,
	}: {
		setState: StateChangeDelegate;
	}) {
		this._setState = setState;
	}
	public closeDialog = () => {
		this._setState((prevState) => {
			const dialogs = prevState.dialogs.slice();
			dialogs.splice(dialogs.length - 1, 1, {
				...dialogs[dialogs.length - 1],
				value: {
					stage: 'closing',
				},
			});
			return {
				dialogs,
			};
		});
	};
	public createDialog(
		arg0: DialogRenderer<SharedState> | React.ReactNode
	): KeyValuePair<number, DialogState> {
		const key = this._key++;
		this._renderers.push({
			key,
			value:
				typeof arg0 === 'function'
					? (arg0 as DialogRenderer<SharedState>)
					: () => arg0,
		});
		return {
			key,
			value: {
				stage: 'opening',
			},
		};
	}
	public getDialogRenderer = (key: number) => {
		return this._renderers.find((renderer) => renderer.key === key).value;
	};
	public handleTransitionCompletion = (
		key: number,
		transition: 'closing' | 'opening'
	) => {
		switch (transition) {
			case 'closing':
				this._setState(
					(prevState) => {
						const dialogs = prevState.dialogs.slice();
						dialogs.splice(
							dialogs.findIndex((dialog) => dialog.key === key),
							1
						);
						return {
							dialogs,
						};
					},
					() => {
						this._renderers.splice(
							this._renderers.findIndex((renderer) => renderer.key === key),
							1
						);
					}
				);
				break;
			case 'opening':
				this._setState((prevState) => {
					const dialogs = prevState.dialogs.slice(),
						dialog = dialogs.find((dialog) => dialog.key === key);
					dialogs.splice(dialogs.indexOf(dialog), 1, {
						...dialog,
						value: {
							stage: 'opened',
						},
					});
					return {
						dialogs,
					};
				});
				break;
		}
	};
	public openDialog = (
		arg0: DialogRenderer<SharedState> | React.ReactNode,
		method: 'push' | 'replace' = 'replace'
	) => {
		this._setState((prevState) => {
			const dialogs = prevState.dialogs.slice();
			dialogs.push(this.createDialog(arg0));
			if (method === 'replace' && dialogs.length > 1) {
				dialogs.splice(dialogs.length - 2, 1, {
					...dialogs[dialogs.length - 2],
					value: {
						stage: 'closing',
					},
				});
			}
			return {
				dialogs,
			};
		});
	};
}
