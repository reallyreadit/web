import WindowApi from '../common/WindowApi';

export default class extends WindowApi {
	public setTitle(title: string) {
		window.document.title = title;
	}
}