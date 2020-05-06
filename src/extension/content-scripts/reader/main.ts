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
import GlobalComponentHost from './GlobalComponentHost';
import CommentsSectionComponentHost from './CommentsSectionComponentHost';
import TitleComponentHost from './TitleComponentHost';
import insertFontStyleElement from '../ui/insertFontStyleElement';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import { AuthServiceBrowserLinkResponse, isAuthServiceBrowserLinkSuccessResponse } from '../../../common/models/auth/AuthServiceBrowserLinkResponse';
import AuthenticationError from '../../../common/models/auth/AuthenticationError';
import BookmarkDialog from '../../../common/components/BookmarkDialog';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import { Intent } from '../../../common/components/Toaster';
import ScrollService from '../../../common/services/ScrollService';
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
	contentRoot: HTMLElement,
	scrollRoot: HTMLElement,
	lookupResult: ArticleLookupResult,
	page: Page,
	authServiceLinkCompletionHandler: (response: AuthServiceBrowserLinkResponse) => void;

// event page interface
const eventPageApi = new EventPageApi({
	onArticleUpdated: event => {
		if (lookupResult) {
			lookupResult.userArticle = event.article;
			header.articleUpdated(event.article);
			title.articleUpdated(event.article);
			commentsSection.articleUpdated(event.article);
		}
	},
	onAuthServiceLinkCompleted: response => {
		if (
			lookupResult &&
			isAuthServiceBrowserLinkSuccessResponse(response) &&
			response.association.provider === AuthServiceProvider.Twitter &&
			!lookupResult.user.hasLinkedTwitterAccount
		) {
			commentsSection.userUpdated(
				lookupResult.user = {
					...lookupResult.user,
					hasLinkedTwitterAccount: true
				}
			);
		}
		if (authServiceLinkCompletionHandler) {
			authServiceLinkCompletionHandler(response);
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
		toggleContentIdentificationDisplay();
	},
	onToggleReadStateDisplay: () => {
		if (page) {
			page.toggleReadStateDisplay();
		}
	},
	onUserSignedOut: () => {
		reader.unloadPage();
		showError('You were signed out in another tab.');
	},
	onUserUpdated: user => {
		if (lookupResult) {
			commentsSection.userUpdated(
				lookupResult.user = user
			);
		}
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

function showError(error: string) {
	(scrollRoot || document.body).style.overflow = 'hidden';
	globalUi.showError(error);
}

let isContentIdentificationDisplayEnabled = false;
function toggleContentIdentificationDisplay() {
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
			styles = {};
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
}

// header ui
const headerContainer = document.createElement('div');
headerContainer.style.position = 'sticky';
headerContainer.style.top = '0';
headerContainer.style.zIndex = '1';
headerContainer.style.transition = 'transform 250ms';

const header = new HeaderComponentHost({
	domAttachmentDelegate: shadowHost => {
		headerContainer.append(shadowHost);
		scrollRoot.prepend(headerContainer);
	},
	services: {
		onReportArticleIssue: request => {
			eventPageApi.reportArticleIssue(request);
			globalUi.toaster.addToast('Issue Reported', Intent.Success);
		}
	}
});

// title ui
const title = new TitleComponentHost({
	domAttachmentDelegate: shadowHost => {
		const wrapper = document.createElement('div');
		wrapper.style.margin = '2.5em 0 1.5em 0';
		wrapper.append(shadowHost);
		contentRoot.prepend(wrapper);
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
		onToggleDebugMode: () => {
			toggleContentIdentificationDisplay();
			page.toggleReadStateDisplay();
		},
		onViewComments: globalUi.viewComments,
		onViewProfile: globalUi.viewProfile
	}
});

// comments ui
const commentsSection = new CommentsSectionComponentHost({
	domAttachmentDelegate: shadowHost => {
		const wrapper = document.createElement('div');
		wrapper.style.margin = '2em 0 0 0';
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
		onLinkAuthServiceAccount: provider => new Promise<AuthServiceAccountAssociation>(
			(resolve, reject) => {
				eventPageApi
					.requestTwitterBrowserLinkRequestToken()
					.then(
						token => {
							const url = new URL('https://api.twitter.com/oauth/authorize');
							url.searchParams.set('oauth_token', token.value);
							eventPageApi
								.openWindow({
									url: url.href,
									width: 400,
									height: 300
								})
								.then(
									windowId => {
										authServiceLinkCompletionHandler = response => {
											if (response.requestToken === token.value) {
												cleanupEventHandlers();
												eventPageApi.closeWindow(windowId);
												if (isAuthServiceBrowserLinkSuccessResponse(response)) {
													resolve(response.association);
												} else {
													let errorMessage: string;
													switch (response.error) {
														case AuthenticationError.Cancelled:
															errorMessage = 'Cancelled';
															break;
													}
													reject(new Error(errorMessage));
												}
											}
										};
										const popupClosePollingInterval = window.setInterval(
											() => {
												eventPageApi
													.hasWindowClosed(windowId)
													.then(
														closed => {
															if (closed) {
																cleanupEventHandlers();
																reject(new Error('Cancelled'));
															}
														}
													)
													.catch(
														() => { }
													);
											},
											1000
										);
										const cleanupEventHandlers = () => {
											authServiceLinkCompletionHandler = null;
											window.clearInterval(popupClosePollingInterval);
										};
									}
								)
								.catch(reject);
						}
					)
					.catch(reject);
			}
		),
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
					header.articleUpdated(article);
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
				prune: (parseResult: ParseResult) => {
					contentRoot: HTMLElement,
					scrollRoot: HTMLElement
				}
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
			const rootElements = results[0].contentParser.prune(contentParseResult);
			contentRoot = rootElements.contentRoot;
			scrollRoot = rootElements.scrollRoot;
			styleArticleDocument(document);

			// set up the global user interface
			insertFontStyleElement();
			globalUi
				.initialize()
				.attach();

			// set up the header user interface
			header
				.initialize()
				.attach();

			new ScrollService({
				scrollElement: scrollRoot,
				setBarVisibility: isVisible => {
					if (isVisible) {
						headerContainer.style.transform = '';
						headerContainer.style.pointerEvents = 'auto';
					} else {
						headerContainer.style.transform = 'translateY(-100%)';
						headerContainer.style.pointerEvents = 'none';
					}
					header.setVisibility(isVisible);
				}
			});
			
			// set up the title user interface
			title
				.initialize({
					authors: metaParseResult.metadata.article.authors.map(author => author.name),
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

							// update the title user interface
							title.articleUpdated(result.userArticle);

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
									BookmarkDialog,
									{
										onClose: globalUi.dialogs.closeDialog,
										onSubmit: () => {
											const bookmarkScrollTop = results[0].page.getBookmarkScrollTop();
											if (bookmarkScrollTop > 0) {
												scrollRoot.scrollTo({
													behavior: 'smooth',
													top: bookmarkScrollTop
												});
											}
											return Promise.resolve();
										}
									}
								)
							);
						}
					}
				)
				.catch(
					(error: string) => {
						showError(error);
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