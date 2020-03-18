import Page from '../../../common/reading/Page';
import EventPageApi from './EventPageApi';
import parseDocumentMetadata from '../../../common/reading/parseDocumentMetadata';
import ContentElement from '../../../common/reading/ContentElement';
import Reader from '../../../common/reading/Reader';
import createPageParseResult from '../../../common/reading/createPageParseResult';
import UserArticle from '../../../common/models/UserArticle';
import ArticleLookupResult from '../../../common/models/ArticleLookupResult';
import ParseResult from '../../../common/contentParsing/ParseResult';
import styleArticleDocument from '../../../common/reading/styleArticleDocument';
import LazyScript from './LazyScript';
import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import GlobalComponentHost from './GlobalComponentHost';
import CommentsSectionComponentHost from './CommentsSectionComponentHost';

window.reallyreadit = {
	readerContentScript: {
		contentParser: new LazyScript(
			() => {
				eventPageApi.loadContentParser();
			}
		)
	}
};

let
	context: {
		contentParseResult: ParseResult,
		lookupResult: ArticleLookupResult,
		page: Page,
		isContentIdentificationDisplayEnabled: boolean
	} | null;

// event page interface
const eventPageApi = new EventPageApi({
	onArticleUpdated: event => {
		if (context && context.lookupResult) {
			context.lookupResult.userArticle = event.article;
		}
		commentsSection.articleUpdated(event.article);
	},
	onCommentPosted: comment => {
		commentsSection.commentPosted(comment);
	},
	onCommentUpdated: comment => {
		commentsSection.commentUpdated(comment);
	},
	onToggleContentIdentificationDisplay: () => {
		if (context) {
			let styles: {
				primaryTextRootNodeBackgroundColor?: string,
				depthGroupWithMostWordsBackgroundColor?: string,
				primaryTextContainerBackgroundColor?: string,
				imageBorder?: string,
				imageCaptionBackgroundColor?: string,
				imageCreditBackgroundColor?: string,
				additionalTextBackgroundColor?: string
			};
			if (context.isContentIdentificationDisplayEnabled = !context.isContentIdentificationDisplayEnabled) {
				styles = {
					primaryTextRootNodeBackgroundColor: 'green',
					depthGroupWithMostWordsBackgroundColor: 'red',
					primaryTextContainerBackgroundColor: 'lime',
					imageBorder: '3px solid magenta',
					additionalTextBackgroundColor: 'yellow'
				};
			} else {
				styles = { };
			}
			(context.contentParseResult.primaryTextRootNode as HTMLElement).style.backgroundColor = styles.primaryTextRootNodeBackgroundColor || '';
			context.contentParseResult.depthGroupWithMostWords.members.forEach(
				member => {
					(member.containerElement as HTMLElement).style.backgroundColor = styles.depthGroupWithMostWordsBackgroundColor || ''
				}
			);
			context.contentParseResult.primaryTextContainerSearchResults.forEach(
				result => {
					(result.textContainer.containerElement as HTMLElement).style.backgroundColor = styles.primaryTextContainerBackgroundColor || '';
				}
			);
			context.contentParseResult.imageContainers.forEach(
				image => {
					(image.containerElement as HTMLElement).style.border = styles.imageBorder || '';
				}
			);
			context.contentParseResult.additionalPrimaryTextContainers.forEach(
				container => {
					(container.containerElement as HTMLElement).style.backgroundColor = styles.additionalTextBackgroundColor || '';
				}
			);
		}
	},
	onToggleReadStateDisplay: () => {
		if (context) {
			context.page.toggleReadStateDisplay();
		}
	}
});

// global ui
const globalUi = new GlobalComponentHost({
	domAttachmentDelegate: shadowHost => {
		document.body.appendChild(shadowHost);
	}
});

// comments ui
const commentsSection = new CommentsSectionComponentHost({
	domAttachmentDelegate: shadowHost => {
		context.page.elements[context.page.elements.length - 1].element.insertAdjacentElement(
			'afterend',
			shadowHost
		)
	},
	services: {
		clipboardService: globalUi.clipboard,
		dialogService: globalUi.dialogs,
		onDeleteComment: form => eventPageApi.deleteComment(form),
		onPostArticle: form => eventPageApi
			.postArticle(form)
			.then(
				post => {
					context.lookupResult.userArticle = post.article;
					return post;
				}
			),
		onPostComment: form => eventPageApi
			.postComment(form)
			.then(
				result => {
					context.lookupResult.userArticle = result.article;
					return result;
				}
			),
		onPostCommentAddendum: form => eventPageApi.postCommentAddendum(form),
		onPostCommentRevision: form => eventPageApi.postCommentRevision(form),
		toasterService: globalUi.toaster
	}
});

function showComments() {
	commentsSection
		.initialize(context.lookupResult.userArticle, context.lookupResult.user)
		.attach();
	eventPageApi
		.getComments(context.lookupResult.userArticle.slug)
		.then(
			comments => {
				commentsSection.commentsLoaded(comments);
			}
		);
}

// reader
const reader = new Reader(
	event => {
		eventPageApi
			.commitReadState(
				{
					readState: event.readStateArray,
					userPageId: context.lookupResult.userPage.id
				},
				event.isCompletionCommit
			)
			.then(
				article => {
					context.lookupResult.userArticle = article;
					if (event.isCompletionCommit) {
						showComments();
					}
					commentsSection.articleUpdated(article);
				}
			);
	}
)

// begin fade out animation
const transitionAnimationDuration = 700;
document.body.style.transition = `opacity ${transitionAnimationDuration / 2}ms`;
document.body.style.opacity = '0';
document.body.classList.add('com_readup_activating_reader_mode');

// parse metadata
const metaParseResult = parseDocumentMetadata();

// begin content parsing and article lookup while the animation is happening
Promise
	.all<
		{
			contentParser: {
				prune: (parseResult: ParseResult) => void
			},
			contentParseResult: ParseResult,
			lookupResult: Promise<ArticleLookupResult>
		},
		void
	>([
		window.reallyreadit.readerContentScript.contentParser
			.get()
			.then(
				contentParser => {
					const contentParseResult = contentParser.parse();
					return {
						contentParser,
						contentParseResult,
						lookupResult: eventPageApi.registerPage(
							createPageParseResult(metaParseResult, contentParseResult)
						)
					};
				}
			),
		new Promise<void>(
			resolve => setTimeout(resolve, transitionAnimationDuration / 2)
		)	
	])
	.then(
		results => {
			// prune and style
			results[0].contentParser.prune(results[0].contentParseResult);
			styleArticleDocument(
				document,
				metaParseResult.metadata.article.title,
				metaParseResult.metadata.article.authors
					.map(
						author => author.name
					)
					.filter(
						name => !!name
					)
					.join(', ')
			);

			// set up the user interface
			globalUi.attach();
			
			// begin fade in animation
			document.body.style.opacity = '1';
			document.body.classList.remove('com_readup_activating_reader_mode');
			
			// process the lookup result while the animation is happening
			Promise
				.all<
					{
						article: UserArticle,
						page: Page
					},
					void
				>([
					results[0].lookupResult.then(
						lookupResult => {
							// create page
							const page = new Page(
								results[0].contentParseResult.primaryTextContainers.map(
									container => new ContentElement(
										container.containerElement as HTMLElement,
										container.wordCount
									)
								)
							);

							// set the context
							context = {
								contentParseResult: results[0].contentParseResult,
								lookupResult,
								page,
								isContentIdentificationDisplayEnabled: false
							};
							page.setReadState(lookupResult.userPage.readState);
							reader.loadPage(page);

							// load the embed user interface
							if (lookupResult.userArticle.isRead) {
								showComments();
							}

							// return the article and page for the bookmark prompt
							return {
								article: lookupResult.userArticle,
								page
							};
						}
					),
					new Promise<void>(
						resolve => setTimeout(resolve, transitionAnimationDuration / 2)
					)
				])
				.then(
					results => {
						// display the bookmark prompt if needed
						if (
							!results[0].article.isRead &&
							results[0].page.getBookmarkScrollTop() > window.innerHeight
						) {
							globalUi.dialogs.openDialog(
								React.createElement(
									Dialog,
									{
										children: 'Want to pick up where you left off?',
										closeButtonText: 'No',
										onClose: globalUi.dialogs.closeDialog,
										onSubmit: () => {
											const bookmarkScrollTop = results[0].page.getBookmarkScrollTop();
											if (bookmarkScrollTop > 0) {
												window.scrollTo({
													behavior: 'smooth',
													top: bookmarkScrollTop
												});
											}
											return Promise.resolve();
										},
										size: 'small',
										submitButtonText: 'Yes',
										textAlign: 'center',
										title: 'Bookmark'
									}
								)
							);
						}
					}
				);
		}
	);

	// unload
window.addEventListener(
	'unload',
	() => {
		eventPageApi.unregisterPage();
	}
);