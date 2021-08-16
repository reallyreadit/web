export const absoluteUrlRegex = /^(https?:)?\/{2}(?!\/)/;
export function getElementAttribute<T extends Element>(element: Element, selector: (element: T) => string) {
	return element ? selector(element as T) : null;
}
export function matchGetAbsoluteUrl(protocol: string, url: string) {
	if (url) {
		const match = url.match(absoluteUrlRegex);
		if (match) {
			if (!match[1]) {
				return protocol.replace(/:$/, '') + ':' + url;
			} else {
				return url;
			}
		}
	}
	return null;
}
export function getWords(text: string) {
	// better to match words instead of splitting on
	// whitespace in order to avoid empty results
	return (text && text.match(/\S+/g)) || [];
}