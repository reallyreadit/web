import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import parseDocumentContent from '../../common/reading/parseDocumentContent';
import Page from '../../common/reading/Page';
import ContentElement from '../../common/reading/ContentElement';
import createPageParseResult from '../../common/reading/createPageParseResult';
import Reader from '../../common/reading/Reader';
import * as ReactDOM from 'react-dom';
import * as  React from 'react';
import Footer from '../../common/components/reader/Footer';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import Rating from '../../common/models/Rating';
import UserArticle from '../../common/models/UserArticle';

const messagingContext = new WebViewMessagingContext();

window.reallyreadit = {
	nativeClient: {
		reader: messagingContext.createIncomingMessageHandlers()
	}
};

let
	articleId: number | null,
	props: {
		isRead: boolean,
		onSelectRating: (rating: number) => Promise<{}>,
		percentComplete: number,
		ratingScore: number | null
	},
	root: HTMLDivElement,
	userPageId: number | null;

const
	contentParseResult = parseDocumentContent('mutate'),
	page = new Page(
		contentParseResult.elements.map(el => new ContentElement(el.element, el.wordCount)),
		false
	),
	reader = new Reader(
		event => {
			messagingContext.sendMessage(
				{
					type: 'commitReadState',
					data: {
						commitData: {
							readState: event.readStateArray,
							userPageId
						},
						isCompletionCommit: event.isCompletionCommit
					}
				},
				(article: UserArticle) => {
					if (article.isRead) {
						if (props) {
							ReactDOM.render(
								React.createElement(
									Footer,
									props = {
										...props,
										...article
									}
								),
								root
							);
						} else {
							constructUserInterface(article);
						}
					}
				}
			)
		}
	);

function constructUserInterface(article: UserArticle) {
	const lastParagraph = page.elements[page.elements.length - 1].element;
	root = lastParagraph.ownerDocument.createElement('div');
	root.id = 'reallyreadit-footer-root';
	lastParagraph.insertAdjacentElement('afterend', root);
	ReactDOM.render(
		React.createElement(
			Footer,
			props = {
				...article,
				onSelectRating: rateArticle
			}
		),
		root
	);
}

function rateArticle(score: number) {
	return new Promise<{}>(resolve => {
		messagingContext.sendMessage(
			{
				type: 'rateArticle',
				data: {
					articleId,
					score
				}
			},
			(rating: Rating) => {
				resolve();
				ReactDOM.render(
					React.createElement(
						Footer,
						props = {
							...props,
							ratingScore: rating.score
						}
					),
					root
				);
			}
		);
	});
}

messagingContext.sendMessage(
	{
		type: 'parseResult',
		data: createPageParseResult(
			parseDocumentMetadata(),
			contentParseResult
		)
	},
	(lookupResult: ArticleLookupResult) => {
		articleId = lookupResult.userArticle.id;
		userPageId = lookupResult.userPage.id;
		page.setReadState(lookupResult.userPage.readState);
		reader.loadPage(page);
		if (lookupResult.userArticle.isRead) {
			constructUserInterface(lookupResult.userArticle);
		}
	}
);