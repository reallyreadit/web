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
import icons from '../../common/svg/icons';
import insertExtensionFontStyleElement from '../content-scripts/ui/insertExtensionFontStyleElement';
import {
	ExtensionOptionKey,
	ExtensionOptions,
	extensionOptionsStorageQuery,
} from './ExtensionOptions';
import OptionsPage from './OptionsPage';

insertExtensionFontStyleElement();

// create the svg icons
const iconsElement = document.createElement('div');
iconsElement.innerHTML = icons;
document.body.append(iconsElement);

// set theme
// TODO: this won't be synced with the theme color now (should it even?)
document.documentElement.dataset.com_readup_theme = 'light';

// options
let options: ExtensionOptions;

function _onChangeStarOnSave(isEnabled: boolean): Promise<boolean> {
	return new Promise((resolve) => {
		chrome.storage.local.set(
			{
				[ExtensionOptionKey.StarOnSave]: isEnabled,
			},
			() => {
				options[ExtensionOptionKey.StarOnSave] = isEnabled;
				resolve(isEnabled);
			}
		);
	});
}

function render() {
	ReactDOM.render(
		React.createElement(OptionsPage, {
			options,
			onChangeStarOnSave: _onChangeStarOnSave,
		}),
		document.getElementById('options-page-root')
	);
}

// initialize options from local storage and perform initial render
chrome.storage.local.get(
	extensionOptionsStorageQuery,
	(storedOptions: ExtensionOptions) => {
		options = storedOptions;
		render();
	}
);
