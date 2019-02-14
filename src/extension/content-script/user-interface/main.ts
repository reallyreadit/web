import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Footer from '../../../common/components/reader/Footer';
import Fetchable from '../../../common/Fetchable';

export interface Props {
	onSelectRating: (rating: number) => Promise<{}>,
	progress: Fetchable<{
		isRead: boolean,
		percentComplete: number
	}>,
	selectedRating: number | null
}

let root: HTMLDivElement | null;
let originalProps: Props | null;

window.reallyreadit.extension.contentScript.userInterface.set({
	construct: (page, props) => {
		const lastParagraph = page.elements[page.elements.length - 1].element;
		root = lastParagraph.ownerDocument.createElement('div');
		root.id = 'reallyreadit-footer-root';
		lastParagraph.insertAdjacentElement('afterend', root);
		ReactDOM.render(
			React.createElement(
				Footer,
				props
			),
			root
		)
		originalProps = props;
	},
	destruct: () => {
		ReactDOM.unmountComponentAtNode(root);
		root.remove();
		root = null;
		originalProps = null;
	},
	update: (props: Partial<Props>) => {
		ReactDOM.render(
			React.createElement(
				Footer,
				{
					...originalProps,
					...props
				}
			),
			root
		)
	}
});