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
import { GlobalError } from './components/Global';
import HeaderComponentHost from './HeaderComponentHost';

window.reallyreadit = {
	readerContentScript: {
		contentParser: new LazyScript(
			() => {
				eventPageApi.loadContentParser();
			}
		)
	}
};

// globals
let
	contentParseResult: ParseResult,
	lookupResult: ArticleLookupResult,
	page: Page;

// event page interface
let isContentIdentificationDisplayEnabled = false;
const eventPageApi = new EventPageApi({
	onArticleUpdated: event => {
		if (lookupResult) {
			lookupResult.userArticle = event.article;
			header.articleUpdated(event.article);
			commentsSection.articleUpdated(event.article);
		}
	},
	onCommentPosted: comment => {
		if (lookupResult) {
			commentsSection.commentPosted(comment);
		}
	},
	onCommentUpdated: comment => {
		if (lookupResult) {
			commentsSection.commentUpdated(comment);
		}
	},
	onToggleContentIdentificationDisplay: () => {
		if (contentParseResult) {
			let styles: {
				primaryTextRootNodeBackgroundColor?: string,
				depthGroupWithMostWordsBackgroundColor?: string,
				primaryTextContainerBackgroundColor?: string,
				imageBorder?: string,
				imageCaptionBackgroundColor?: string,
				imageCreditBackgroundColor?: string,
				additionalTextBackgroundColor?: string
			};
			if (isContentIdentificationDisplayEnabled = !isContentIdentificationDisplayEnabled) {
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
			(contentParseResult.primaryTextRootNode as HTMLElement).style.backgroundColor = styles.primaryTextRootNodeBackgroundColor || '';
			contentParseResult.depthGroupWithMostWords.members.forEach(
				member => {
					(member.containerElement as HTMLElement).style.backgroundColor = styles.depthGroupWithMostWordsBackgroundColor || ''
				}
			);
			contentParseResult.primaryTextContainerSearchResults.forEach(
				result => {
					(result.textContainer.containerElement as HTMLElement).style.backgroundColor = styles.primaryTextContainerBackgroundColor || '';
				}
			);
			contentParseResult.imageContainers.forEach(
				image => {
					(image.containerElement as HTMLElement).style.border = styles.imageBorder || '';
				}
			);
			contentParseResult.additionalPrimaryTextContainers.forEach(
				container => {
					(container.containerElement as HTMLElement).style.backgroundColor = styles.additionalTextBackgroundColor || '';
				}
			);
		}
	},
	onToggleReadStateDisplay: () => {
		if (page) {
			page.toggleReadStateDisplay();
		}
	},
	onUserSignedOut: () => {
		reader.unloadPage();
		showError(GlobalError.UserSignedOut);
	}
});

// global ui
const globalUi = new GlobalComponentHost({
	domAttachmentDelegate: shadowHost => {
		shadowHost.style.position = 'fixed';
		shadowHost.style.bottom = '0';
		shadowHost.style.left = '0';
		shadowHost.style.width = '0';
		shadowHost.style.height = '0';
		shadowHost.style.margin = '0';
		shadowHost.style.padding = '0';
		shadowHost.style.transform = 'none';
		shadowHost.style.zIndex = '2147483647';
		document.body.appendChild(shadowHost);
	}
});

function showError(error: GlobalError) {
	document.body.style.overflow = 'hidden';
	globalUi.showError(error);
}

// header ui
const header = new HeaderComponentHost({
	domAttachmentDelegate: shadowHost => {
		const wrapper = document.createElement('div');
		wrapper.style.marginBottom = '1.5em';
		wrapper.append(shadowHost);
		document
			.getElementById('com_readup_article_content')
			.prepend(wrapper);
	},
	services: {
		onCreateAbsoluteUrl: globalUi.createAbsoluteUrl,
		onSetStarred: isStarred => eventPageApi
			.setStarred({
				articleId: lookupResult.userArticle.id,
				isStarred
			})
			.then(
				article => {
					lookupResult.userArticle = article;
					return article;
				}
			),
		onViewComments: globalUi.viewComments,
		onViewProfile: globalUi.viewProfile
	}
});

// comments ui
const commentsSection = new CommentsSectionComponentHost({
	domAttachmentDelegate: shadowHost => {
		const wrapper = document.createElement('div');
		wrapper.style.marginTop = '2em';
		wrapper.append(shadowHost);
		page.elements[page.elements.length - 1].element.insertAdjacentElement(
			'afterend',
			wrapper
		)
	},
	services: {
		clipboardService: globalUi.clipboard,
		dialogService: globalUi.dialogs,
		onCreateAbsoluteUrl: globalUi.createAbsoluteUrl,
		onDeleteComment: form => eventPageApi.deleteComment(form),
		onNavTo: globalUi.navTo,
		onPostArticle: form => eventPageApi
			.postArticle(form)
			.then(
				post => {
					lookupResult.userArticle = post.article;
					return post;
				}
			),
		onPostComment: form => eventPageApi
			.postComment(form)
			.then(
				result => {
					lookupResult.userArticle = result.article;
					return result;
				}
			),
		onPostCommentAddendum: form => eventPageApi.postCommentAddendum(form),
		onPostCommentRevision: form => eventPageApi.postCommentRevision(form),
		onShare: globalUi.handleShareRequest,
		onViewProfile: globalUi.viewProfile,
		toasterService: globalUi.toaster
	}
});

function showComments() {
	commentsSection
		.initialize(lookupResult.userArticle, lookupResult.user)
		.attach();
	eventPageApi
		.getComments(lookupResult.userArticle.slug)
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
					userPageId: lookupResult.userPage.id
				},
				event.isCompletionCommit
			)
			.then(
				article => {
					lookupResult.userArticle = article;
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
			// store the parse result
			contentParseResult = results[0].contentParseResult;

			// prune and style
			results[0].contentParser.prune(contentParseResult);
			styleArticleDocument(document);

			// set up the user interface
			globalUi.attach();
			
			// set up the header user interface
			header
				.initialize({
					animationDuration: transitionAnimationDuration / 2,
					authors: metaParseResult.metadata.article.authors
						.reduce<string[]>(
							(authors, author) => {
								if (!!author.name) {
									const authorName = author.name.trim();
									if (
										!authors.some(
											existingAuthorName => existingAuthorName.toLowerCase() === authorName.toLowerCase()
										)
									) {
										authors.push(authorName);
									}
								}
								return authors;
							},
							[]
						)
						.sort(),
					title: metaParseResult.metadata.article.title,
					wordCount: contentParseResult.primaryTextContainers.reduce((sum, el) => sum + el.wordCount, 0)
				})
				.attach();

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
						result => {
							// store the lookup result
							lookupResult = result;

							// create page
							page = new Page(
								contentParseResult.primaryTextContainers.map(
									container => new ContentElement(
										container.containerElement as HTMLElement,
										container.wordCount
									)
								)
							);
							page.setReadState(result.userPage.readState);
							reader.loadPage(page);

							// update the header user interface
							header.articleUpdated(result.userArticle);

							// load the embed user interface
							if (result.userArticle.isRead) {
								showComments();
							}

							// return the article and page for the bookmark prompt
							return {
								article: result.userArticle,
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
				)
				.catch(
					() => {
						header.deinitialize();
						showError(GlobalError.ArticleLookupFailure);
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