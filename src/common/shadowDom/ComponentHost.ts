// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import icons from '../svg/icons';

export type DomAttachmentDelegate = (shadowHost: HTMLElement) => void;
export default abstract class ComponentHost<Services, State> {
	protected abstract readonly _component:
		| React.FunctionComponent<Services & State>
		| React.ComponentClass<Services & State>;
	private readonly _domAttachmentDelegate: DomAttachmentDelegate;
	private _isAttached = false;
	private readonly _reactContainer: HTMLElement;
	protected abstract readonly _services: Services;
	private readonly _shadowHost: HTMLElement;
	private readonly _shadowRoot: ShadowRoot;
	protected abstract _state: State;
	constructor({
		domAttachmentDelegate,
	}: {
		domAttachmentDelegate: DomAttachmentDelegate;
	}) {
		// store the dom attachment delegate
		this._domAttachmentDelegate = domAttachmentDelegate;

		// create the react container and shadow host
		this._reactContainer = document.createElement('div');
		this._shadowHost = document.createElement('div');
		this._shadowHost.style.visibility = 'hidden';

		// set initial theme and listen for changes
		this.setTheme();
		window.addEventListener('com.readup.themechange', () => {
			this.setTheme();
		});

		// create shadow root by attaching to host
		this._shadowRoot = this._shadowHost.attachShadow({
			mode: 'open',
		});
	}
	private setTheme() {
		this._shadowHost.dataset['com_readup_theme'] =
			document.documentElement.dataset['com_readup_theme'];
	}
	protected abstract getStylesheetUrl(): string;
	public attach() {
		// check if we're already attached
		if (this._isAttached) {
			return;
		}
		this._isAttached = true;

		// create the shadow dom style link
		const styleLink = document.createElement('link');
		styleLink.rel = 'stylesheet';
		styleLink.href = this.getStylesheetUrl();

		// create the svg icons
		const iconsElement = document.createElement('div');
		iconsElement.innerHTML = icons;

		// append children to root
		this._shadowRoot.append(styleLink, iconsElement, this._reactContainer);

		// append the root to the document
		this._domAttachmentDelegate(this._shadowHost);
	}
	public setState(nextState: Partial<State>) {
		return new Promise((resolve) => {
			ReactDOM.render(
				React.createElement(this._component, {
					...this._services,
					...(this._state = {
						...this._state,
						...nextState,
					}),
				}),
				this._reactContainer,
				resolve
			);
		});
	}
}
