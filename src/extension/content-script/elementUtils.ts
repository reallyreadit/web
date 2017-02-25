import templates from './templates';

export function getLineHeight(block: Element) {
    const blankText = templates.blankText;
    let lineHeight;
    block.appendChild(blankText);
    lineHeight = blankText.getBoundingClientRect().height;
    blankText.remove();
    return lineHeight;
}
export function getContentRect(block: Element) {
    const computedStyle = getComputedStyle(block),
        border = {
            top: parseInt(computedStyle.borderTopWidth),
            right: parseInt(computedStyle.borderRightWidth),
            bottom: parseInt(computedStyle.borderBottomWidth),
            left: parseInt(computedStyle.borderLeftWidth)
        },
        padding = {
            top: parseInt(computedStyle.paddingTop),
            right: parseInt(computedStyle.paddingRight),
            bottom: parseInt(computedStyle.paddingBottom),
            left: parseInt(computedStyle.paddingLeft)
        },
        rect = block.getBoundingClientRect();
    return {
        top: window.pageYOffset + rect.top + border.top + padding.top,
        left: rect.left + border.left + padding.left,
        width: rect.width - border.left - padding.left - padding.right - border.right,
        height: rect.height - border.top - padding.top - padding.bottom - border.bottom
    };
}
export function getElementAttribute<T extends Element>(element: Element, selector: (element: T) => string) {
	return element ? selector(element as T) : null;
}