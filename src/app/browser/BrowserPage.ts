import Page, { InitData, State } from '../common/Page';

export default class BrowserPage extends Page {
	private _isInitialized = false;
	constructor(initData: InitData) {
		super();
		this._title = initData.title;
		this._newReplyNotification = initData.newReplyNotification;
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