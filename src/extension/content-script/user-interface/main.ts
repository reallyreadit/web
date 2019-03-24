import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Footer from '../../../common/components/reader/Footer';
import Logo from './components/Logo';

export interface Props {
	onSelectRating: (rating: number) => Promise<{}>,
	ratingScore: number | null
}

let root: HTMLDivElement | null;
let lastProps: Props & { children: React.ReactNode } | null;

window.reallyreadit.extension.contentScript.userInterface.set({
	construct: (page, props) => {
		const lastParagraph = page.elements[page.elements.length - 1].element;
		root = lastParagraph.ownerDocument.createElement('div');
		root.id = 'reallyreadit-footer-root';
		lastParagraph.insertAdjacentElement('afterend', root);
		ReactDOM.render(
			React.createElement(
				Footer,
				lastProps = {
					...props,
					children: React.createElement(Logo)
				}
			),
			root
		);
	},
	destruct: () => {
		ReactDOM.unmountComponentAtNode(root);
		root.remove();
		root = null;
		lastProps = null;
	},
	isConstructed: () => {
		return !!root;
	},
	update: (props: Partial<Props>) => {
		ReactDOM.render(
			React.createElement(
				Footer,
				lastProps = { ...lastProps, ...props }
			),
			root
		)
	}
});