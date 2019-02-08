import * as React from 'react';
import classNames from 'classnames';

export enum Intent {
	Success,
	Danger
}
const intentClassMap = {
	[Intent.Success]: 'success',
	[Intent.Danger]: 'danger'
};
export interface ToastEvent {
	content: React.ReactNode,
	intent: Intent,
}
export interface Toast extends ToastEvent {
	timeoutHandle: number,
	remove: boolean
}
export default class Toaster extends React.PureComponent<{
	onRemoveToast: (timeoutHandle: number) => void,
	toasts: Toast[]
}, {}> {
	private _removeToast = (e: React.AnimationEvent<{}>) => {
		if (e.animationName === 'toaster_2zbeib-pop-out') {
			this.props.onRemoveToast(parseInt((e.currentTarget as Element).getAttribute('data-timeout-handle')));
		}
	};
	public render() {
		return (
			<div className="toaster_2zbeib">
				<ul className="toasts">
					{this.props.toasts.map(toast =>
						<li
							className={classNames('toast', intentClassMap[toast.intent], { remove: toast.remove })}
							key={toast.timeoutHandle}
							data-timeout-handle={toast.timeoutHandle}
							onAnimationEnd={this._removeToast}
						>
							{toast.content}
						</li>)}
				</ul>
			</div>
		);
	}
}