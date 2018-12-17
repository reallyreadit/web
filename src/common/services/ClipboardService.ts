import { Intent } from "../components/Toaster";

export default class ClipboardService {
	private _clipboardTextInput: HTMLInputElement | undefined;
	private readonly _addToast: (content: string, intent: Intent) => void;
	constructor(onAddToast: (content: string, intent: Intent) => void) {
		this._addToast = onAddToast;
	}
	public copyText = (text: string, successMessage: string) => {
		if (this._clipboardTextInput) {
			this._clipboardTextInput.value = text;
			this._clipboardTextInput.select();
			window.document.execCommand('copy');
			this._clipboardTextInput.value = '';
			this._addToast(successMessage, Intent.Success);
		}
	};
	public setTextInputRef = (ref: HTMLInputElement) => {
		this._clipboardTextInput = ref;
	};
}