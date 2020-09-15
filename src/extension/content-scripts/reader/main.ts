import Page from '../../../common/reading/Page';
import EventPageApi from './EventPageApi';
import parseDocumentMetadata from '../../../common/reading/parseDocumentMetadata';
import Reader from '../../../common/reading/Reader';
import createPageParseResult from '../../../common/reading/createPageParseResult';
import UserArticle from '../../../common/models/UserArticle';
import ArticleLookupResult from '../../../common/models/ArticleLookupResult';
import ParseResult from '../../../common/contentParsing/ParseResult';
import styleArticleDocument, { applyDisplayPreferenceToArticleDocument } from '../../../common/reading/styleArticleDocument';
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
import UserAccount from '../../../common/models/UserAccount';
import { createCommentThread } from '../../../common/models/social/Post';
import CommentThread from '../../../common/models/CommentThread';
import DisplayPreference, { getDisplayPreferenceChangeMessage } from '../../../common/models/userAccounts/DisplayPreference';

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
	displayPreference: DisplayPreference | null,
	contentRoot: HTMLElement,
	scrollRoot: HTMLElement,
	lookupResult: ArticleLookupResult,
	page: Page,
	authServiceLinkCompletionHandler: (response: AuthServiceBrowserLinkResponse) => void;

function updateArticle(article: UserArticle) {
	if (!lookupResult) {
		return;
	}
	lookupResult.userArticle = article;
	header.articleUpdated(article);
	title.articleUpdated(article);
	if (commentsSection.isInitialized) {
		commentsSection.articleUpdated(article);
	} else if (article.isRead) {
		commentsSection
			.initialize(article, lookupResult.user)
			.attach();
		eventPageApi
			.getComments(article.slug)
			.then(
				comments => {
					commentsSection.commentsLoaded(comments);
				}
			);
	}
}

function updateDisplayPreference(preference: DisplayPreference) {
	const textSizeChanged = (
		displayPreference == null ||
		displayPreference.textSize !== preference.textSize
	);
	displayPreference = preference;
	header.displayPreferenceUpdated(preference);
	applyDisplayPreferenceToArticleDocument(preference);
	if (textSizeChanged && page) {
		page.updateLineHeight();
	}
}

function updateUser(user: UserAccount) {
	if (!lookupResult) {
		return;
	}
	lookupResult.user = user;
	commentsSection.userUpdated(user);
}

function addComment(comment: CommentThread) {
	commentsSection.commentPosted(comment);
}

function updateComment(comment: CommentThread) {
	commentsSection.commentUpdated(comment);
}

// event page interface
const eventPageApi = new EventPageApi({
	onArticleUpdated: event => {
		updateArticle(event.article);
	},
	onAuthServiceLinkCompleted: response => {
		if (
			lookupResult &&
			isAuthServiceBrowserLinkSuccessResponse(response) &&
			response.association.provider === AuthServiceProvider.Twitter &&
			!lookupResult.user.hasLinkedTwitterAccount
		) {
			updateUser({
				...lookupResult.user,
				hasLinkedTwitterAccount: true
			});
		}
		if (authServiceLinkCompletionHandler) {
			authServiceLinkCompletionHandler(response);
		}
	},
	onCommentPosted: comment => {
		addComment(comment);
	},
	onCommentUpdated: comment => {
		updateComment(comment);
	},
	onDisplayPreferenceChanged: preference => {
		updateDisplayPreference(preference);
	},
	onUserSignedOut: () => {
		reader.unloadPage();
		showError('You were signed out in another tab.');
	},
	onUserUpdated: user => {
		updateUser(user);
	}
});

// document messaging interface
window.addEventListener(
	'message',
	event => {
		if (!event.origin.endsWith('readup.com')) {
			return;
		}
		switch (event.data?.type as String || null) {
			case 'toggleVisualDebugging':
				page?.toggleVisualDebugging();
				break;
		}
	}
);

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
		onChangeDisplayPreference: preference => {
			if (displayPreference) {
				const message = getDisplayPreferenceChangeMessage(displayPreference, preference);
				if (message) {
					globalUi.toaster.addToast(message, Intent.Success);
				}
			}
			updateDisplayPreference(preference);
			return eventPageApi.changeDisplayPreference(preference);
		},
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
					updateArticle(article);
				}
			),
		onToggleDebugMode: () => {
			page.toggleVisualDebugging();
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
		onDeleteComment: form => eventPageApi
			.deleteComment(form)
			.then(
				comment => {
					updateComment(comment);
					return comment;
				}
			),
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
					updateArticle(post.article);
					if (post.comment) {
						addComment(
							createCommentThread(post)
						);
					}
					return post;
				}
			),
		onPostComment: form => eventPageApi
			.postComment(form)
			.then(
				result => {
					updateArticle(result.article);
					addComment(result.comment);
				}
			),
		onPostCommentAddendum: form => eventPageApi
			.postCommentAddendum(form)
			.then(
				comment => {
					updateComment(comment);
					return comment;
				}
			),
		onPostCommentRevision: form => eventPageApi
			.postCommentRevision(form)
			.then(
				comment => {
					updateComment(comment);
					return comment;
				}
			),
		onShare: globalUi.handleShareRequest,
		onViewProfile: globalUi.viewProfile,
		toasterService: globalUi.toaster
	}
});

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
					updateArticle(article);
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
		DisplayPreference | null,
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
		eventPageApi.getDisplayPreference(),
		new Promise<void>(
			resolve => setTimeout(resolve, transitionAnimationDuration / 2)
		)	
	])
	.then(
		results => {
			// store the parse result
			contentParseResult = results[0].contentParseResult;

			// store the display preference
			displayPreference = results[1];

			// prune and style
			const rootElements = results[0].contentParser.prune(contentParseResult);
			contentRoot = rootElements.contentRoot;
			scrollRoot = rootElements.scrollRoot;
			styleArticleDocument({
				displayPreference,
				document,
				useScrollContainer: true
			});

			// set up the global user interface
			const resetStyleLink = document.createElement('link');
			resetStyleLink.rel = 'stylesheet';
			resetStyleLink.href = chrome.runtime.getURL('/content-scripts/reader/reset.css');
			document.head.appendChild(resetStyleLink);
			insertFontStyleElement();
			globalUi
				.initialize()
				.attach();

			// set up the header user interface
			header
				.initialize(displayPreference)
				.attach();

			new ScrollService({
				scrollContainer: scrollRoot,
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
							page = new Page(contentParseResult.primaryTextContainers);
							page.setReadState(result.userPage.readState);
							reader.loadPage(page);
							
							// trigger an update
							updateArticle(lookupResult.userArticle);
							updateUser(lookupResult.user);

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