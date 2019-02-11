import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import parseDocumentContent from '../../common/reading/parseDocumentContent';
import Page from '../../common/reading/Page';
import UserPage from '../../common/models/UserPage';
import ContentElement from '../../common/reading/ContentElement';
import createPageParseResult from '../../common/reading/createPageParseResult';
import Reader from '../../common/reading/Reader';
import * as ReactDOM from 'react-dom';
import * as  React from 'react';
import Footer from '../../common/components/reader/Footer';

const messagingContext = new WebViewMessagingContext();

window.reallyreadit = {
	nativeClient: {
		reader: messagingContext.createIncomingMessageHandlers()
	}
};

const
	contentParseResult = parseDocumentContent('mutate'),
	page = new Page(
		contentParseResult.elements.map(el => new ContentElement(el.element, el.wordCount)),
		false
	),
	reader = new Reader(
		(commitData, isCompletionCommit) => {
			messagingContext.sendMessage(
				{
					type: 'commitReadState',
					data: { commitData, isCompletionCommit }
				}
			)
		}
	)

messagingContext.sendMessage(
	{
		type: 'parseResult',
		data: createPageParseResult(
			parseDocumentMetadata(),
			contentParseResult
		)
	},
	(userPage: UserPage) => {
		page.initialize(userPage);
		reader.loadPage(page);
		const lastParagraph = page.elements[page.elements.length - 1].element;
		const root = lastParagraph.ownerDocument.createElement('div');
		root.id = 'reallyreadit-footer-root';
		lastParagraph.insertAdjacentElement('afterend', root);
		ReactDOM.render(
			React.createElement(
				Footer
			),
			root
		)
	}
);