import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Footer from '../../../common/components/reader/Footer';

let root: HTMLDivElement;

window.reallyreadit.extension.contentScript.userInterface.set({
	construct: page => {
		const lastParagraph = page.elements[page.elements.length - 1].element;
		root = lastParagraph.ownerDocument.createElement('div');
		root.id = 'reallyreadit-footer-root';
		lastParagraph.insertAdjacentElement('afterend', root);
		ReactDOM.render(
			React.createElement(
				Footer
			),
			root
		)
	},
	destruct: () => {
		ReactDOM.unmountComponentAtNode(root);
		root.remove();
		root = null;
	}
});