import Page, { State } from '../common/Page';

export default class ServerPage extends Page {
	public setState(state: Partial<State>) {
		if ('title' in state) {
			this._title = state.title;
		}
	}
}