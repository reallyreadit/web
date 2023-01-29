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

export enum Intent {
	Success,
	Danger,
	Neutral,
}
const intentClassMap = {
	[Intent.Success]: 'success',
	[Intent.Danger]: 'danger',
	[Intent.Neutral]: 'neutral',
};
export interface ToastEvent {
	content: React.ReactNode;
	intent: Intent;
}
export interface Toast extends ToastEvent {
	timeoutHandle: number;
	remove: boolean;
}
export default class Toaster extends React.PureComponent<
	{
		onRemoveToast: (timeoutHandle: number) => void;
		toasts: Toast[];
	},
	{}
> {
	private _removeToast = (e: React.AnimationEvent<{}>) => {
		if (e.animationName === 'toaster_2zbeib-pop-out') {
			this.props.onRemoveToast(
				parseInt(
					(e.currentTarget as Element).getAttribute('data-timeout-handle')
				)
			);
		}
	};
	public render() {
		return (
			<div className="toaster_2zbeib">
				<ul className="toasts">
					{this.props.toasts.map((toast) => (
						<li
							className={classNames('toast', intentClassMap[toast.intent], {
								remove: toast.remove,
							})}
							key={toast.timeoutHandle}
							data-timeout-handle={toast.timeoutHandle}
							onAnimationEnd={this._removeToast}
						>
							{toast.content}
						</li>
					))}
				</ul>
			</div>
		);
	}
}
