import * as React from 'react';
import Context, { contextTypes } from '../../Context';
import { Intent, ToastEvent } from '../../Page';
import * as className from 'classnames';

const intentClassMap = {
	[Intent.Success]: 'success',
	[Intent.Danger]: 'danger'
};
interface Toast extends ToastEvent {
	timeoutHandle: number,
	remove: boolean
}
export default class Toaster extends React.Component<{}, { toasts: Toast[] }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _addToast = (toastEvent: ToastEvent) => {
		const toast: Toast = {
			...toastEvent,
			timeoutHandle: window.setTimeout(() => {
				const toasts = this.state.toasts.slice();
				toasts[toasts.indexOf(toast)] = { ...toast, remove: true };
				this.setState({ toasts });
			}, 5000),
			remove: false
		};
		this.setState({ toasts: [...this.state.toasts, toast] });
	};
	private _removeToast = (e: React.AnimationEvent<{}>) => {
		if (e.animationName === 'toaster-pop-out') {
			this.setState({
				toasts: this.state.toasts.filter(toast => toast.timeoutHandle !== parseInt((e.currentTarget as Element).getAttribute('data-timeout-handle')))
			});
		}
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = { toasts: [] };
	}
	public componentDidMount() {
		this.context.page.addListener('showToast', this._addToast);
	}
	public componentWillUnmount() {
		this.context.page.removeListener('showToast', this._addToast);
		this.state.toasts.forEach(toast => window.clearTimeout(toast.timeoutHandle));
	}
	public render() {
		return (
			<div className="toaster">
				<ul className="toasts">
					{this.state.toasts.map(toast =>
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