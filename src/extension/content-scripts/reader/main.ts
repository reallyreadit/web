import Page from '../../../common/reading/Page';
import EventPageApi from './EventPageApi';
import parseDocumentMetadata from '../../../common/reading/parseDocumentMetadata';
import Reader from '../../../common/reading/Reader';
import createPageParseResult from '../../../common/reading/createPageParseResult';
import UserArticle from '../../../common/models/UserArticle';
import ArticleLookupResult from '../../../common/models/ArticleLookupResult';
import ParseResult from '../../../common/contentParsing/ParseResult';
import styleArticleDocument, { applyDisplayPreferenceToArticleDocument, darkBackgroundColor, lightBackgroundColor } from '../../../common/reading/styleArticleDocument';
import LazyScript from './LazyScript';
import * as React from 'react';
import GlobalComponentHost from './GlobalComponentHost';
import CommentsSectionComponentHost from './CommentsSectionComponentHost';
import TitleComponentHost from './TitleComponentHost';
import insertExtensionFontStyleElement from '../ui/insertExtensionFontStyleElement';
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
import DisplayPreference, { DisplayTheme, getDisplayPreferenceChangeMessage } from '../../../common/models/userAccounts/DisplayPreference';
import { getPromiseErrorMessage } from '../../../common/format';
import {ShareChannelData} from '../../../common/sharing/ShareData';
import ShareChannel from '../../../common/sharing/ShareChannel';
import {createQueryString} from '../../../common/routing/queryString';
import {createTweetWebIntentUrl} from '../../../common/sharing/twitter';

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
	authServiceLinkCompletionHandler: (response: AuthServiceBrowserLinkResponse) => void,
	hasStyledArticleDocument = false

/**
 * Tells the components in this reader to refresh themselves
 * with the latest UserArticle data, when a lookup result exists. 
 */
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

function updateDisplayPreference(preference: DisplayPreference | null) {
	let textSizeChanged = false;
	if (preference) {
		textSizeChanged = (
			displayPreference == null ||
			displayPreference.textSize !== preference.textSize
		);
		displayPreference = preference;
		header.displayPreferenceUpdated(preference);
	}
	applyDisplayPreferenceToArticleDocument(preference);
	window.dispatchEvent(
		new CustomEvent(
			'com.readup.themechange',
			{
				detail: preference?.theme
			}
		)
	);
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

/**
 * Tell the components in this reader that a new
 * CommentThread was posted to the loaded article.
 */
function addComment(comment: CommentThread) {
	commentsSection.commentPosted(comment);
}

function updateComment(comment: CommentThread) {
	commentsSection.commentUpdated(comment);
}

// event page interface: initialize with event handlers
// for events coming from the Event Page
const eventPageApi = new EventPageApi({
	onArticleUpdated: event => {
		updateArticle(event.article);
	},
	/** Update the locally cached user with its new logged in
	 *  state via Twitter, in case such a login happened.
	 */
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
		// only update if already styled
		if (hasStyledArticleDocument) {
			updateDisplayPreference(preference);
		} else {
			displayPreference = preference;
		}
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
		if (!/(\/\/|\.)readup\.com$/.test(event.origin)) {
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
		/**
		 * Reacts on the change of display preferences in the header component,
		 * syncs these preferences to the locally stored compoments, as well as forwards 
		 * them to the general app via the event page interface.
		 */
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
		onShareViaChannel: (data: ShareChannelData) => {
			switch (data.channel) {
				case ShareChannel.Clipboard:
					globalUi.clipboard.copyText(data.text, 'Link copied to clipboard');
					break;
				case ShareChannel.Email:
					globalUi.navTo(`mailto:${createQueryString({
						'body': data.body,
						'subject': data.subject
					})}`);
					break;
				case ShareChannel.Twitter:
					globalUi.navTo(
						createTweetWebIntentUrl(data)
					);
					break;
			}
		},
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
			)
	}
)

// parse metadata
// TODO PROXY EXT: the param might be wrong or not necessary
const metaParseResult = parseDocumentMetadata({url: {
	protocol: window.location.protocol,
	hostname: window.location.hostname,
	href: window.location.href
}});

// try and get a cached copy of the display preference for the transition animation
eventPageApi
	.getDisplayPreference()
	.then(
		cachedDisplayPreference => {
			// begin fade out animation
			const transitionAnimationDuration = 700;
			document.body.style.transition = `opacity ${transitionAnimationDuration / 2}ms`;
			document.body.style.opacity = '0';
			if (cachedDisplayPreference) {
				let preferredBackgroundColor: string;
				switch (cachedDisplayPreference.theme) {
					case DisplayTheme.Light:
						preferredBackgroundColor = lightBackgroundColor;
						break;
					case DisplayTheme.Dark:
						preferredBackgroundColor = darkBackgroundColor;
						break;
				}
				document.documentElement.style.transition = `background-color ${transitionAnimationDuration / 2}ms`;
				document.documentElement.style.background = 'none';
				document.documentElement.style.backgroundImage = 'none';
				document.documentElement.style.backgroundColor = preferredBackgroundColor;
			}

			// begin content parsing and article lookup while the animation is happening
			Promise
				.all([
					window.reallyreadit.readerContentScript.contentParser
						.get()
						.then(
							contentParser => {
								const contentParseResult = contentParser.parse({
									url: window.location
								});
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
						styleArticleDocument({
							useScrollContainer: true,
							transitionElement: document.body
						});
						hasStyledArticleDocument = true;

						// intercept mouseup event on article content to prevent article scripts from handling
						document
							.getElementById('com_readup_article_content')
							.addEventListener(
								'mouseup',
								event => {
									event.stopPropagation();
								}
							);

						// update the display preference
						// this version is loaded from local storage. prefer an existing copy
						// that would have been set by an external change event.
						updateDisplayPreference(displayPreference || cachedDisplayPreference);

						// set up the global user interface
						const resetStyleLink = document.createElement('link');
						resetStyleLink.rel = 'stylesheet';
						resetStyleLink.href = chrome.runtime.getURL('/content-scripts/reader/reset.css');
						document.head.appendChild(resetStyleLink);
						insertExtensionFontStyleElement();
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

						// process the lookup result while the animation is happening
						Promise
							.all([
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
								reason => {
									showError(
										getPromiseErrorMessage(reason)
									);
								}
							);
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