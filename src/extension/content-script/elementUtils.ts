export function getElementAttribute<T extends Element>(element: Element, selector: (element: T) => string) {
	return element ? selector(element as T) : null;
}