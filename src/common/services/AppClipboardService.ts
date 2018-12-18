import ClipboardService from "./ClipboardService";

export default class AppClipboardService extends ClipboardService {
	protected setTextSelection() {
		const
			range = window.document.createRange(),
			selection = window.getSelection();

		range.selectNodeContents(this._clipboardTextInput);
		
		selection.removeAllRanges();
		selection.addRange(range);

		this._clipboardTextInput.setSelectionRange(0, 999999);
	}
}