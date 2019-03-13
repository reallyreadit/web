import { Intent } from "../components/Toaster";

export default class ClipboardService {
	protected _clipboardTextInput: HTMLInputElement | undefined;
	private readonly _addToast: (content: string, intent: Intent) => void;
	constructor(onAddToast: (content: string, intent: Intent) => void) {
		this._addToast = onAddToast;
	}
	private setTextSelection() {
		if (/(iPhone|iPad)/i.test(window.navigator.userAgent)) {
			const
				range = window.document.createRange(),
				selection = window.getSelection();

			range.selectNodeContents(this._clipboardTextInput);

			selection.removeAllRanges();
			selection.addRange(range);

			this._clipboardTextInput.setSelectionRange(0, 999999);
		} else {
			this._clipboardTextInput.select();
		}
	}
	public copyText = (text: string, successMessage?: string) => {
		if (this._clipboardTextInput) {
			this._clipboardTextInput.value = text;
			this.setTextSelection();
			window.document.execCommand('copy');
			this._clipboardTextInput.value = '';
			if (successMessage)  {
				this._addToast(successMessage, Intent.Success);
			}
		}
	};
	public setTextInputRef = (ref: HTMLInputElement) => {
		this._clipboardTextInput = ref;
	};
}