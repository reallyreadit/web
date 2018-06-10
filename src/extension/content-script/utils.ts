export const absoluteUrlRegex = /^(https?:)?\/{2}(?!\/)/;
export function getElementAttribute<T extends Element>(element: Element, selector: (element: T) => string) {
	return element ? selector(element as T) : null;
}
export function matchGetAbsoluteUrl(url: string) {
	if (url) {
		const match = url.match(absoluteUrlRegex);
		if (match) {
			if (!match[1]) {
				return window.location.protocol + url;
			} else {
				return url;
			}
		}
	}
	return null;
}