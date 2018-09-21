import * as React from 'react';
import * as className from 'classnames';

export enum Intent {
	Success,
	Danger
}
const intentClassMap = {
	[Intent.Success]: 'success',
	[Intent.Danger]: 'danger'
};
export interface ToastEvent {
	text: string,
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
		if (e.animationName === 'toaster-pop-out') {
			this.props.onRemoveToast(parseInt((e.currentTarget as Element).getAttribute('data-timeout-handle')));
		}
	};
	public render() {
		return (
			<div className="toaster">
				<ul className="toasts">
					{this.props.toasts.map(toast =>
						<li
							className={className('toast', intentClassMap[toast.intent], { remove: toast.remove })}
							key={toast.timeoutHandle}
							dangerouslySetInnerHTML={{ __html: toast.text.replace(/\n/g, '<br />') }}
							data-timeout-handle={toast.timeoutHandle}
							onAnimationEnd={this._removeToast}
						>
						</li>)}
				</ul>
			</div>
		);
	}
}