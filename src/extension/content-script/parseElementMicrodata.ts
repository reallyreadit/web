type ItemType = { [key: string]: ItemProp | ItemProp[] };
type ItemProp = string | ItemType;

const valueMap: { [key: string]: string } = {
	'a': 'href',
	'img': 'src',
	'link': 'href',
	'meta': 'content',
	'object': 'data',
	'time': 'datetime'
};
function isScopeElement(element: Element) {
	return element.hasAttribute('itemscope') || element.hasAttribute('itemtype');
}
function getElementValue(element: Element) {
	// use getAttribute instead of property to avoid case-sensitivity issues
	const tagName = element.tagName.toLowerCase();
	return valueMap.hasOwnProperty(tagName) ? element.getAttribute(valueMap[tagName]) : element.textContent;
}
function getElementType(element: Element, isTopLevel?: boolean) {
	const type: { [key: string]: ItemProp } = {};
	if (element.hasAttribute('itemtype')) {
		if (isTopLevel) {
			type['@context'] = 'http://schema.org';
		}
		type['@type'] = new URL(element.getAttribute('itemtype')).pathname.substring(1);
	}
	return type;
}
function mergeValue(properties: string[], value: string, scope: ItemType): string;
function mergeValue(properties: string[], value: ItemType, scope: ItemType): ItemType;
function mergeValue(properties: string[], value: ItemProp, scope: ItemType) {
	properties.forEach(property => {
		if (scope.hasOwnProperty(property)) {
			if (scope[property] instanceof Array) {
				(scope[property] as ItemProp[]).push(value);
			} else {
				scope[property] = [scope[property] as ItemProp, value];
			}
		} else {
			scope[property] = value;
		}
	});
	return value;
}
function parseElementMicrodata(element: Element, topLevelTypes: ItemType[] = [], scope: ItemType = null) {
	// check element for microdata attributes
	// check for scope to guard against invalid itemprops declared outside a scope
	if (scope && element.hasAttribute('itemprop')) {
		const properties = element.getAttribute('itemprop').split(' ');
		if (isScopeElement(element)) {
			// value is a type
			scope = mergeValue(properties, getElementType(element), scope);
		} else {
			// value is a primitive
			mergeValue(properties, getElementValue(element), scope);
		}
	} else if (isScopeElement(element)) {
		// new top level type
		topLevelTypes.push(scope = getElementType(element, true));
	}
	// process children
	for (let i = 0; i < element.children.length; i++) {
		parseElementMicrodata(element.children[i], topLevelTypes, scope);
	}
	// return top level types
	return topLevelTypes;
}

export default parseElementMicrodata;