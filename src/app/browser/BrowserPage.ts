import Page, { State } from '../common/Page';

export default class BrowserPage extends Page {
	private _isInitialized = false;
	constructor(title: string) {
		super();
		this._title = title;
	}
	public setState(state: Partial<State>) {
		if (this._isInitialized) {
			super.setState(state);
			if ('title' in state) {
				window.document.title = state.title;
			}
		}
	}
	public initialize() {
		this._isInitialized = true;
	}
} 