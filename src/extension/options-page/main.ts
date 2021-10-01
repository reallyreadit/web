import * as React from 'react';
import * as ReactDOM from 'react-dom';
import icons from '../../common/svg/icons';
import insertExtensionFontStyleElement from '../content-scripts/ui/insertExtensionFontStyleElement';
import {ExtensionOptionKey, ExtensionOptions} from './ExtensionOptions';
import OptionsPage from './OptionsPage';

insertExtensionFontStyleElement();

// create the svg icons
const iconsElement = document.createElement('div');
iconsElement.innerHTML = icons;
document.body.append(iconsElement)

// set theme
// TODO: this won't be synced with the theme color now (should it even?)
document.documentElement.dataset.com_readup_theme = 'light';

// options
const defaultOptions: ExtensionOptions = {
	[ExtensionOptionKey.StarOnSave]: true
}

const options: ExtensionOptions = {
	...defaultOptions
}

function _onChangeStarOnSave(isEnabled: boolean): Promise<boolean> {
	try {
		localStorage.setItem(ExtensionOptionKey.StarOnSave, isEnabled.toString());
		options[ExtensionOptionKey.StarOnSave] = isEnabled;
		return Promise.resolve(isEnabled);
	} catch (e) {
		// return original value if something went wrong
		// TODO: this may lead to weird UI behavior in OptionsPage
		console.error(e);
		return Promise.resolve(options[ExtensionOptionKey.StarOnSave])
	}
}

function render() {
	ReactDOM.render(
		React.createElement(OptionsPage, {
			options,
			onChangeStarOnSave: _onChangeStarOnSave
		}),
		document.getElementById('options-page-root')
	)
}

// initialize options from local storage
if (localStorage.getItem(ExtensionOptionKey.StarOnSave) !== null) {
	options[ExtensionOptionKey.StarOnSave] = (localStorage.getItem(ExtensionOptionKey.StarOnSave) === 'true');
}

// initial render
render();