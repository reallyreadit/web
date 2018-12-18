import { Intent } from "../components/Toaster";

export default abstract class ClipboardService {
	protected _clipboardTextInput: HTMLInputElement | undefined;
	private readonly _addToast: (content: string, intent: Intent) => void;
	constructor(onAddToast: (content: string, intent: Intent) => void) {
		this._addToast = onAddToast;
	}
	protected abstract setTextSelection(): void;
	public copyText = (text: string, successMessage: string) => {
		if (this._clipboardTextInput) {
			this._clipboardTextInput.value = text;
			this.setTextSelection();
			window.document.execCommand('copy');
			this._clipboardTextInput.value = '';
			this._addToast(successMessage, Intent.Success);
		}
	};
	public setTextInputRef = (ref: HTMLInputElement) => {
		this._clipboardTextInput = ref;
	};
}