import WindowApi from '../common/WindowApi';

export default class extends WindowApi {
	private _title: string;
	public setTitle(title: string) {
		this._title = title;
	}
	public getTitle() {
		return this._title;
	}
}