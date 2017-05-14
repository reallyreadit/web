import EventEmitter from './EventEmitter';

export interface State {
	title: string,
	isLoading: boolean
}
abstract class Page extends EventEmitter<{
	'change': State,
	'reload': void
}> {
	protected _title: string;
	private _isLoading: boolean;
	public setState(state: Partial<State>) {
		if ('title' in state) {
			this._title = state.title;
		}
		if ('isLoading' in state) {
			this._isLoading = state.isLoading;
		}
		this.emitEvent('change', {
			title: this._title,
			isLoading: this._isLoading
		});
	}
	public reload() {
		this.emitEvent('reload', null);
	}
	public get title() {
		return this._title;
	}
	public get isLoading() {
		return this._isLoading;
	}
}
export default Page;