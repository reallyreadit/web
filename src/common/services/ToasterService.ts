import AsyncTracker from '../AsyncTracker';
import { Toast, Intent } from '../components/Toaster';

export interface State {
	toasts: Toast[]
}
export default class ToasterService {
	private readonly _asyncTracker: AsyncTracker;
	private readonly _setState: (state: (prevState: State) => Pick<State, keyof State>) => void;
	constructor(deps: {
		asyncTracker: AsyncTracker,
		setState: (state: (prevState: State) => Pick<State, keyof State>) => void
	}) {
		this._asyncTracker = deps.asyncTracker;
		this._setState = deps.setState;
	}
	public addToast = (content: React.ReactNode, intent: Intent, remove: boolean = true) => {
		const toast = {
			content,
			intent,
			timeoutHandle: remove ?
				this._asyncTracker.addTimeout(
					window.setTimeout(() => {
						this._setState(prevState => {
							const toasts = prevState.toasts.slice();
							toasts[toasts.indexOf(toast)] = { ...toast, remove: true };
							return { toasts };
						});
					}, 5000)
				) :
				0,
			remove: false
		};
		this._setState(prevState => ({ toasts: [...prevState.toasts, toast] }));
	};
	public removeToast = (timeoutHandle: number) => {
		this._setState(prevState => ({
			toasts: prevState.toasts.filter(toast => toast.timeoutHandle !== timeoutHandle)
		}));
	};
}