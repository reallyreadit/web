import icons from '../../../common/svg/icons';

export function createReactShadowDom(shadowHost: Element) {
	// create the shadow dom style link
	const styleLink = document.createElement('link');
	styleLink.rel = 'stylesheet';
	styleLink.href = `chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-scripts/reader/bundle.css`;

	// create the svg icons
	const iconsElement = document.createElement('div');
	iconsElement.innerHTML = icons;

	// create the react root element
	const reactRoot = document.createElement('div');

	// attach to host
	const shadowRoot = shadowHost.attachShadow({
		mode: 'open'
	});

	// react compatibility hack (https://github.com/facebook/react/issues/9242)
	Object.defineProperty(reactRoot, 'ownerDocument', { value: shadowRoot });
	(shadowRoot as any).createElement = (...args: any[]) => (document as any).createElement(...args);
	(shadowRoot as any).createElementNS = (...args: any[]) => (document as any).createElementNS(...args);
	(shadowRoot as any).createTextNode = (...args: any[]) => (document as any).createTextNode(...args);

	// append children to root
	shadowRoot.append(styleLink, iconsElement, reactRoot);

	// return the react root
	return reactRoot;
}