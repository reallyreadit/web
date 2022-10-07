import insertFontStyleElement from '../../../common/shadowDom/insertFontStyleElement';

export default function insertExtensionFontStyleElement() {
	return insertFontStyleElement(
		chrome.runtime.getURL('/content-scripts/ui/fonts/')
	);
}