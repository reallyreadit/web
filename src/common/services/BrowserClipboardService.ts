import ClipboardService from "./ClipboardService";

export default class BrowserClipboardService extends ClipboardService {
	protected setTextSelection() {
		this._clipboardTextInput.select();
	}
}