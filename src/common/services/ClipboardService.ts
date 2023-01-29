// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { Intent } from '../components/Toaster';
import { getDeviceType, DeviceType } from '../DeviceType';

export default class ClipboardService {
	protected _clipboardTextInput: HTMLInputElement | undefined;
	private readonly _addToast: (content: string, intent: Intent) => void;
	constructor(onAddToast: (content: string, intent: Intent) => void) {
		this._addToast = onAddToast;
	}
	private setTextSelection() {
		if (getDeviceType(window.navigator.userAgent) === DeviceType.Ios) {
			const range = window.document.createRange(),
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
			if (successMessage) {
				this._addToast(successMessage, Intent.Success);
			}
		}
	};
	public setTextInputRef = (ref: HTMLInputElement) => {
		this._clipboardTextInput = ref;
	};
}
