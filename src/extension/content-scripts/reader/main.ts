import Page from '../../../common/reading/Page';
import EventPageApi from './EventPageApi';
import parseDocumentMetadata, { MetadataParseResult } from '../../../common/reading/parseDocumentMetadata';
import Reader from '../../../common/reading/Reader';
import createPageParseResult from '../../../common/reading/createPageParseResult';
import UserArticle from '../../../common/models/UserArticle';
import styleArticleDocument, {
	applyDisplayPreferenceToArticleDocument,
	createByline,
	updateArticleHeader,
} from '../../../common/reading/styleArticleDocument';
import * as React from 'react';
import AuthServiceAccountAssociation from '../../../common/models/auth/AuthServiceAccountAssociation';
import {
	AuthServiceBrowserLinkResponse,
	isAuthServiceBrowserLinkSuccessResponse,
} from '../../../common/models/auth/AuthServiceBrowserLinkResponse';
import AuthenticationError from '../../../common/models/auth/AuthenticationError';
import BookmarkDialog from '../../../common/components/BookmarkDialog';
import AuthServiceProvider from '../../../common/models/auth/AuthServiceProvider';
import ScrollService from '../../../common/services/ScrollService';
import UserAccount from '../../../common/models/UserAccount';
import Post, { createCommentThread } from '../../../common/models/social/Post';
import CommentThread from '../../../common/models/CommentThread';
import DisplayPreference, { getClientDefaultDisplayPreference, DisplayTheme } from '../../../common/models/userAccounts/DisplayPreference';
import ShareChannel from '../../../common/sharing/ShareChannel';
import { parseQueryString, extensionAuthQueryStringKey } from '../../../common/routing/queryString';
import { ParserDocumentLocation } from '../../../common/ParserDocumentLocation';
import { DeviceType } from '../../../common/DeviceType';
import parseDocumentContent from '../../../common/contentParsing/parseDocumentContent';
import pruneDocument from '../../../common/contentParsing/pruneDocument';
import { findPublisherConfig } from '../../../common/contentParsing/configuration/PublisherConfig';
import configs from '../../../common/contentParsing/configuration/configs';
import procesLazyImages from '../../../common/contentParsing/processLazyImages';
import ReaderUIEmbed, {
	Props as EmbedProps,
} from '../../../common/reader-app/ReaderUIEmbed';
import { AppPlatform } from '../../../common/AppPlatform';
import DialogService from '../../../common/services/DialogService';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import { parseUrlForRoute } from '../../../common/routing/Route';
import ScreenKey from '../../../common/routing/ScreenKey';
import PostForm from '../../../common/models/social/PostForm';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import ArticleIssueReportRequest from '../../../common/models/analytics/ArticleIssueReportRequest';
import ReactDOM = require('react-dom');
import { mergeComment, updateComment } from '../../../common/comments';
import { createArticleSlug } from '../../../common/routing/routes';
import UserPage from '../../../common/models/UserPage';
import { createUrl } from '../../../common/HttpEndpoint';
import { ExtensionOptionKey } from '../../options-page/ExtensionOptions';
import ParseResult from '../../../common/contentParsing/ParseResult';
import ReaderReminder from '../../../common/components/ReaderReminder';
import { isReadupElement } from '../../../common/contentParsing/utils';

// TODO PROXY EXT: taken from the native reader
// our case is similar to
// ensure the rest also respects this documentLocation

const {
	url
} = parseQueryString(window.location.search);

let documentLocation: ParserDocumentLocation = new URL(url);

// TODO PROXY EXT: emulating the native reader, just hardcoded something here
// DesktopChrome is used for Electron (linux, windows)
let deviceType: DeviceType = DeviceType.DesktopChrome;

// TODO PROXY EXT: native article, fill these vars
let displayPreference: DisplayPreference | null;
let article: UserArticle | null;
let page: Page | null;
let userPage: UserPage | null;
let user: UserAccount | null;
let contentRoot: HTMLElement;
let scrollRoot: HTMLElement;

// These global parse results are assigned during initialization and never change afterwards.
let metadataParseResult: MetadataParseResult;
let contentParseResult: ParseResult;

// globals
let authServiceLinkCompletionHandler: (
	response: AuthServiceBrowserLinkResponse
) => void;
let hasStyledArticleDocument = false;

/**
 * Renders or re-renders the reader UI embed.
 */
function render(
	props?: Partial<
		Pick<EmbedProps, Exclude<keyof EmbedProps, 'article' | 'user'>>
	>,
	callback?: () => void
) {
	Promise
		.all([
			new Promise(
				resolve => {
					ReactDOM.render(
						React.createElement(ReaderUIEmbed, {
							...(embedProps = {
								...embedProps,
								...props,
							}),
							article: {
								isLoading: !article,
								value: article,
							},
							displayPreference,
							user,
						}),
						embedRootElement,
						resolve
					);
				}
			),
			new Promise(
				resolve => {
					ReactDOM.render(
						React.createElement(
							ReaderReminder,
							{
								...reminderProps,
								isActive: !user && !reminderState.isDismissed && !reminderState.isDisabled
							}
						),
						reminderRootElement,
						resolve
					);
				}
			)
		])
		.then(callback);
}

// user interface
const dialogService = new DialogService({
	setState: (delegate, callback) => {
		render(delegate(embedProps), callback);
	},
});

/**
 * Reacts on the change of display preferences in the header component,
 * syncs these preferences to the locally stored compoments, as well as forwards
 * them to the general app via the event page interface.
 */
const onChangeDisplayPreference = (
	preference: DisplayPreference
): Promise<DisplayPreference> => {
	updateDisplayPreference(preference);
	return eventPageApi.changeDisplayPreference(preference);
};

const onDeleteComment = async (
	form: CommentDeletionForm
): Promise<CommentThread> =>
	eventPageApi.deleteComment(form).then((comment: CommentThread) => {
		render({
			comments: {
				...embedProps.comments,
				value: updateComment(comment, embedProps.comments.value),
			},
		});

		return comment;
	});

const onReportArticleIssue = (request: ArticleIssueReportRequest): void => {
	eventPageApi.reportArticleIssue(request);
};

const onLinkAuthServiceAccount = async (
	provider: AuthServiceProvider
): Promise<AuthServiceAccountAssociation> =>
	new Promise<AuthServiceAccountAssociation>((resolve, reject) => {
		eventPageApi
			.requestTwitterBrowserLinkRequestToken()
			.then((token) => {
				const url = new URL('https://api.twitter.com/oauth/authorize');
				url.searchParams.set('oauth_token', token.value);
				eventPageApi
					.openWindow({
						url: url.href,
						width: 400,
						height: 300,
					})
					.then((windowId) => {
						authServiceLinkCompletionHandler = (response) => {
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
						const popupClosePollingInterval = window.setInterval(() => {
							eventPageApi
								.hasWindowClosed(windowId)
								.then((closed) => {
									if (closed) {
										cleanupEventHandlers();
										reject(new Error('Cancelled'));
									}
								})
								.catch(() => {});
						}, 1000);
						const cleanupEventHandlers = () => {
							authServiceLinkCompletionHandler = null;
							window.clearInterval(popupClosePollingInterval);
						};
					})
					.catch(reject);
			})
			.catch(reject);
	});

// TODO PROXY EXT copied from global host ui
// seems fine? because this is intended for iOS only?
// and the shareViaChannel is handled inside app
const handleShareRequest = () => {
	return {
		channels: [
			ShareChannel.Clipboard,
			ShareChannel.Email,
			ShareChannel.Twitter,
		],
	};
};

function openInNewTab(url: string) {
	window.open(url, '_blank');
}

function readArticle(slug: string) {
	eventPageApi.readArticle(slug);
}

// handle article and embed links
function handleLink(url: string) {
	const result = parseUrlForRoute(url);
	if (
		result.isInternal &&
		result.route &&
		result.route.screenKey === ScreenKey.Read
	) {
		readArticle(
			createArticleSlug(result.route.getPathParams(result.url.pathname))
		);
		return true;
	} else if (result.url) {
		openInNewTab(result.url.href);
		return true;
	}
	return false;
}

function renderNewComment(comment: CommentThread) {
	render({
		comments: {
			...embedProps.comments,
			value: mergeComment(comment, embedProps.comments.value),
		},
	});
}

// PROXY EXT NOTE: this does not exit in the native reader
function renderUpdatedComment(comment: CommentThread) {
	render({
		comments: {
			...embedProps.comments,
			value: updateComment(comment, embedProps.comments.value),
		},
	});
}

const onPostComment = (form: CommentForm): Promise<void> =>
	eventPageApi.postComment(form).then((result) => {
		// updateUserArticle(result.article);
		// addComment(result.comment);
		article = result.article;
		renderNewComment(result.comment);
	});

const onPostArticle = (form: PostForm): Promise<Post> =>
	eventPageApi.postArticle(form).then((post) => {
		article = post.article;
		if (post.comment) {
			render({
				comments: {
					...embedProps.comments,
					value: mergeComment(
						createCommentThread(post),
						embedProps.comments.value
					),
				},
			});
		} else {
			render();
		}
		return post;
	});

const onPostCommentAddendum = (
	form: CommentAddendumForm
): Promise<CommentThread> =>
	eventPageApi.postCommentAddendum(form).then((comment) => {
		render({
			comments: {
				...embedProps.comments,
				value: updateComment(comment, embedProps.comments.value),
			},
		});
		return comment;
	});

const onPostCommentRevision = (
	form: CommentRevisionForm
): Promise<CommentThread> =>
	eventPageApi.postCommentRevision(form).then((comment) => {
		render({
			comments: {
				...embedProps.comments,
				value: updateComment(comment, embedProps.comments.value),
			},
		});
		return comment;
	});

async function toggleStar() {
	// Even eventPageApi.setStarred returns a promise, it seems like it only does
	// so after it's done processing the action (synchronously).
	// For this reason we have to wrap the function in another, immediately-returned
	// promise, so that the "is starring" state gets activated.
	return new Promise<void>((resolve, reject) => {
		eventPageApi
			.setStarred({
				// articleId: lookupResult.userArticle.id,
				articleId: article.id,
				// isStarred
				isStarred: article.dateStarred ? false : true,
			})
			.then((result) => {
				if (result) {
					article = result;
					render();
					resolve();
				} else {
					reject();
				}
			})
			.catch(reject);
	});
}

function onCreateAbsoluteUrl(path: string) {
	return createUrl(window.reallyreadit.extension.config.webServer, path);
}

let embedProps: Pick<
	EmbedProps,
	Exclude<keyof EmbedProps, 'article' | 'displayPreference' | 'user'>
> = {
	// TODO PROXY EXT: can we make this unnecessary
	// appPlatform: initData.appPlatform,
	appPlatform: AppPlatform.Windows,
	comments: null,
	deviceType,
	dialogs: [],
	dialogService,
	isHeaderHidden: false,
	onChangeDisplayPreference: onChangeDisplayPreference,
	onCreateAbsoluteUrl,
	onDeleteComment: onDeleteComment,
	onLinkAuthServiceAccount: onLinkAuthServiceAccount,
	onNavBack: () => {
		// TODO PROXY EXT: this depends on the reader being loaded
		// in the same tab as where the article request happened
		// In case of action button.
		window.history.go(-1);
	},
	onNavTo: handleLink,
	onPostArticle,
	onPostComment,
	onPostCommentAddendum,
	onPostCommentRevision: onPostCommentRevision,
	onReportArticleIssue: onReportArticleIssue,
	onShare: handleShareRequest,
	onToggleStar: toggleStar,
};
let embedRootElement: HTMLDivElement;
// This is the props object and container element for the sign-in reminder react component.
const reminderProps = {
	onSignIn: () => {
		openInNewTab(createUrl(window.reallyreadit.extension.config.webServer, null, { [extensionAuthQueryStringKey]: null }))
	},
	onDismiss: async (disableReminder: boolean) => {
		reminderState.isDismissed = true;
		if (disableReminder) {
			await chrome.storage.local.set({ 'disableSignInReminder': true });
			reminderState.isDisabled = true;
		}
		render();
	}
};
let reminderState = {
	// This is the in-memory ephemeral preference for this reader tab.
	isDismissed: false,
	// This is synced during initialization with the preference persisted to extension storage.
	isDisabled: false
};
let reminderRootElement: HTMLDivElement;

/**
 * Inserts an element in the document that contains an attachment point for ReaderUIEmbed.tsx via render(),
 * which is thehost for reader-related UI & behavior.
 *
 * Depends on context. These variables should be available:
 * - scrollRoot
 * - contentRoot
 *
 * This element injector should be called after the document has been "pruned".
 * This allows the embed to be inserted after the #com_readup_article_content element,
 * which means the natural position of the App in the document flow is *after* the article content.
 * Note that this is exactly the place where the comment section should be rendered by the App.
 */
function insertEmbed() {
	// create root element
	embedRootElement = window.document.createElement('div');
	embedRootElement.id = 'com_readup_embed';
	embedRootElement.className = 'com_readup_container';
	scrollRoot.append(embedRootElement);
	// create reminder element
	reminderRootElement = window.document.createElement('div');
	reminderRootElement.id = 'com_readup_reminder';
	reminderRootElement.className = 'com_readup_container';
	scrollRoot.prepend(reminderRootElement);
	// initial render
	render();
	// create scroll service
	const scrollService = new ScrollService({
		scrollContainer: window,
		setBarVisibility: (isVisible) => {
			if (isVisible === embedProps.isHeaderHidden) {
				// TODO PROXY NOTE: we unfortunately can't control the status bar visibility in browser
				// setStatusBarVisibility(isVisible);
				render({
					isHeaderHidden: !isVisible,
				});
			}
		},
	});
	// add click listener to toggle header
	contentRoot.addEventListener('click', () => {
		const isHeaderHidden = !embedProps.isHeaderHidden;
		scrollService.setBarVisibility(!isHeaderHidden);
		// TODO PROXY NOTE: we unfortunately can't control the status bar visibility in browser
		// setStatusBarVisibility(!isHeaderHidden);
		render({
			isHeaderHidden,
		});
	});
}

/**
 * Let the components in this reader know that the display preference has changed,
 * following an external or internal action. Sets the font-size, theme and link visibility.
 */
function updateDisplayPreference(preference: DisplayPreference | null) {
	let textSizeChanged = false;
	if (preference) {
		textSizeChanged =
			displayPreference == null ||
			displayPreference.textSize !== preference.textSize;
		displayPreference = preference;
		render();
	}
	applyDisplayPreferenceToArticleDocument(preference);

	// TODO PROXY EXT: this doesn't happen in the native reader.
	// The shadowhost ComponentHost listened to this, we don't need it anymore
	// But the alert content script does too, maybe we need that one?
	window.dispatchEvent(
		new CustomEvent('com.readup.themechange', {
			detail: preference?.theme,
		})
	);

	if (textSizeChanged && page) {
		page.updateLineHeight();
	}

	// Synchronize the display preference with the state in the URL.
	const url = new URL(window.location.href);
	if (preference) {
		url.searchParams.set('theme', preference.theme === DisplayTheme.Light ? 'light' : 'dark');
	} else {
		url.searchParams.delete('theme');
	}
	window.history.replaceState(null, document.title, url.toString());
}

function updateUser(userIn: UserAccount) {
	// PROXY EXT NOTE: user is not kept in lookupResult anymore
	// if(!lookupResult) {
	// 	return;
	// }
	// lookupResult.user = user;
	// commentsSection.userUpdated(user);
	user = userIn;
	// rerender
	render();
}

// event page interface: initialize with event handlers
// for events coming from the Event Page
const eventPageApi = new EventPageApi({
	onArticleUpdated: ({ article }) => {
		// NOTE: the native reader doesn't have this handler
		// Nothing is done with the isCompletionCommit in the event
		renderUserArticle(article);
	},
	// TODO PROXY EXT: lookup result handling different
	/** Update the locally cached user with its new logged in
	 *  state via Twitter, in case such a login happened.
	 */
	onAuthServiceLinkCompleted: (response) => {
		if (
			article &&
			user &&
			userPage &&
			isAuthServiceBrowserLinkSuccessResponse(response) &&
			response.association.provider === AuthServiceProvider.Twitter &&
			!user.hasLinkedTwitterAccount
		) {
			updateUser({
				...user,
				hasLinkedTwitterAccount: true,
			});
		}
		if (authServiceLinkCompletionHandler) {
			authServiceLinkCompletionHandler(response);
		}
	},
	onCommentPosted: (comment) => {
		renderNewComment(comment);
	},
	onCommentUpdated: (comment) => {
		renderUpdatedComment(comment);
	},
	onDisplayPreferenceChanged: (preference) => {
		// TODO PROXY EXT: native does not have an equivalent of this
		// only update if already styled
		if (hasStyledArticleDocument) {
			updateDisplayPreference(preference);
		} else {
			displayPreference = preference;
		}
	},
	onUserSignedIn: async () => {
		eventPageApi.startLoadingAnimation();
		await loadUserArticle();
		eventPageApi.stopLoadingAnimation();
	},
	onUserSignedOut: async () => {
		await unloadUserArticle();
	},
	onUserUpdated: (updatedUser) => {
		updateUser(updatedUser);
	},
});

// document messaging interface
window.addEventListener('message', (event) => {
	if (!/(\/\/|\.)readup\.org$/.test(event.origin)) {
		return;
	}
	switch ((event.data?.type as String) || null) {
		case 'toggleVisualDebugging':
			page?.toggleVisualDebugging();
			break;
	}
});

// Should we make a quick fix for allowing this? Or handle it inside the App?
// function showError(error: string) {
// 	(scrollRoot || document.body).style.overflow = 'hidden';
// 	globalUi.showError(error);
// }

// PROXY EXT NOTE: adapted from native
function loadComments() {
	render({
		comments: {
			isLoading: true,
		},
	});
	eventPageApi.getComments(article.slug).then((comments: CommentThread[]) => {
		render({
			comments: {
				isLoading: false,
				value: comments,
			},
		});
	});
}

function renderUserArticle(articleIn: UserArticle) {
	article = articleIn;
	if (article.isRead && !embedProps.comments) {
		loadComments();
	} else {
		render();
	}
}

// reader
const reader = new Reader((event) => {
	eventPageApi
		.commitReadState(
			{
				readState: event.readStateArray,
				userPageId: userPage.id,
			},
			event.isCompletionCommit
		)
		.then((articleIn) => {
			renderUserArticle(articleIn);
			// updateUserArticle(article);
		})
		// TODO PROXY EXT: native messagingContext has ProblemDetails here
		.catch((error) => console.error(error));
});

// parse metadata

async function fetchAndInjectArticle() {
	// Test adding some content
	// TODO PROXY EXT: this gives an error without
	// any content. The parsing script really expects something to be in `<body>`
	// should fail more gracefully!

	let doc: Document;
	try {
		const text = await fetch(documentLocation.href, {
			// TODO PROXY EXT: the article test server fails without cookies/credentials enabled
			// because it sets an expected ID cookie with redirects.
			// The desired behavior here will depend on de site.
			// credentials: 'omit'
			credentials: 'include',
		}).then((r) => r.text());
		const parser = new DOMParser();
		doc = parser.parseFromString(text, 'text/html');
		processArticleContent(doc);
	} catch (e) {
		console.error('oops, something went wrong while fetching the article');
		throw e;
	}

	// Hide the content to-be-injected until the parsed result can be shown
	doc.body.style.opacity = '0';
	doc.body.style.transition = 'none';

	// Inject the article content
	document.body = doc.body;

	// Replace the head content without removing the temp background style element.
	const deleteQueue = [];
	for (const child of document.head.children) {
		if (!isReadupElement(child)) {
			deleteQueue.push(child);
		}
	}
	while (deleteQueue.length) {
		deleteQueue
			.pop()
			.remove();
	}
	const moveQueue = Array.from(doc.head.children);
	while (moveQueue.length) {
		document.head.append(moveQueue.pop());
	}
}

async function processArticleContent(doc: Document) {
	// Sanitize unwanted elements from HTML
	const removeElementsWithQuerySelector = (selector: string) =>
		Array.from(doc.querySelectorAll(selector)).forEach((e) => e.remove());
	// TODO: is this a correct replication?

	const querySelectorsForElementsToRemove = [
		'script:not([type="application/json+ld"])',
		// 'link[rel="preload"][as="script"]',
		// 'link[rel="preload"][as="style"]',
		// 'link[rel="preload"][as="font"]',
		'link[rel="preload"]',
		'iframe',
		'style',
		'link[rel="stylesheet"]',
		'meta[name="viewport"]',
	];
	querySelectorsForElementsToRemove.forEach((qs) =>
		removeElementsWithQuerySelector(qs)
	);

	// Insert replacement viewport tag
	// TODO test
	const metaTag = document.createElement('meta');
	metaTag.name = 'viewport';
	metaTag.content =
		'width=device-width,initial-scale=1,minimum-scale=1,viewport-fit=cover';
	document.head.insertAdjacentElement('afterbegin', metaTag);

	// Make relative image requests absolute
	Array.from(doc.querySelectorAll('img')).forEach((img) => {
		// Detect relative URLs, without extraction.
		// See https://regex101.com/r/YbzyN7/1 for unit tests
		// img.src is already a processed "src" attribute: it's always an absolute url.
		const host = `${documentLocation.protocol}//${documentLocation.hostname}`;

		let href = documentLocation.href;
		let hrefParts = href.split('/');

		const originalSrc = img.getAttribute('src');
		const match =
			/(^\/(?!\/))|(^\.\/)|(^\.\.\/)|(^(?!https?:\/\/)[-a-z0-9)]+)/.exec(
				originalSrc
			);
		if (!originalSrc) {
			// TODO: sometimes src="" happens, but srcset is set in those cases. Support srcset here?
			return;
		}
		if (originalSrc.startsWith('data:')) {
			// Do nothing, this is a base64 or svg+xml encoded image
			return;
		}
		if (match) {
			if (match[1]) {
				// The URL is of the form /image.png.
				img.src = `${host}${originalSrc}`;
			} else {
				if (match[2] || match[4]) {
					// The URL is of the form ./image.png or image.png
					// These relative URLs are immediately relative to the current folder
					const relativeImagePathMatch = /^(\.\/)?(.*)$/.exec(originalSrc);
					const relativeImagePath = relativeImagePathMatch[1];
					if (relativeImagePath) {
						if (href.endsWith('/')) {
							// Add path relative to the current directory on to it
							img.src = `${href}${relativeImagePath}`;
						} else {
							// the href ends in someting like /index.php -> pop it off to address a sibling
							const hrefPartsCopy = [...hrefParts];
							hrefPartsCopy.pop();
							const newHrefBase = hrefPartsCopy.join('/');
							img.src = `${newHrefBase}/${relativeImagePath}`;
						}
					} else {
						console.warn(
							"Problem in determining the absolute image URL of a './' relative format image"
						);
					}
				} else if (match[3]) {
					// The URL is of the form ../image.png
					const relativeImagePathMatch = /^(\.\.\/)(.*)$/.exec(originalSrc);
					const relativeImagePath = relativeImagePathMatch[1];
					if (relativeImagePath) {
						const hrefPartsCopy = [...hrefParts];
						if (href.endsWith('/')) {
							// pops ''
							hrefPartsCopy.pop();
						}
						// pops the name of the parent folder
						hrefPartsCopy.pop();
						const newHrefBase = hrefPartsCopy.join('/');
						img.src = `${newHrefBase}/${relativeImagePath}`;
					} else {
						console.warn(
							"Problem in determining the absolute image URL of a '../' relative format image"
						);
					}
				}
			}
		}
	});
}

// const transitionAnimationDuration = 700;

// Try and get a cached copy of the display preference for the transition animation
// TODO PROXY EXT: top level async/await not allowed in TS target ES5
// eventPageApi.getDisplayPreference().then(
// 	async (cachedDisplayPreference) => {
async function initialize() {
	eventPageApi.registerPage();

	eventPageApi.startLoadingAnimation();

	await fetchAndInjectArticle();

	metadataParseResult = parseDocumentMetadata({
		url: documentLocation,
	});

	contentParseResult = parseDocumentContent({
		url: documentLocation,
	});

	const parseResult = pruneDocument(contentParseResult);
	contentRoot = parseResult.contentRoot;
	scrollRoot = parseResult.scrollRoot;

	// PROXY EXT NOTE: userScrollContainer was true in web. Needed?
	styleArticleDocument({
		header: {
			title: metadataParseResult.metadata.article.title,
			byline: createByline(metadataParseResult.metadata.article.authors),
		},
		transitionElement: document.body,
	});

	// Set the global user object before rendering the UI.
	user = await eventPageApi.getUserAccountFromCache();

	// Initialize the sign-in reminder preference from storage.
	const storageQuery = await chrome.storage.local.get('disableSignInReminder');
	reminderState.isDisabled = !!storageQuery['disableSignInReminder'];

	// insert React UI
	insertEmbed();

	// Update the display preference (re-renders the first time)
	// Sets the font and background color.
	displayPreference = await eventPageApi.getDisplayPreferenceFromCache();
	if (displayPreference == null) {
		displayPreference = await eventPageApi.changeDisplayPreference(getClientDefaultDisplayPreference());
	}
	updateDisplayPreference(displayPreference);

	// See build/targets/extension/contentScripts/reader.js
	// We need to load these here (after document pruning and styling)
	window.reallyreadit.extension.injectInlineStyles();
	window.reallyreadit.extension.injectSvgElements();

	// Complete the fade-in transition of the text
	document.body.style.transition = 'opacity 350ms';
	document.body.style.opacity = '1';

	// TODO EXT NOTE: web needed this, but native doesn't have
	hasStyledArticleDocument = true;
	const publisherConfig = findPublisherConfig(
		configs.publishers,
		documentLocation.hostname
	);
	procesLazyImages(publisherConfig?.imageStrategy);

	// PROXY EXT NOTE: native doesn't have this, still needed?
	// Intercept mouseup event on article content to prevent article scripts
	// from handling click events.
	document
		.getElementById('com_readup_article_content')
		.addEventListener('mouseup', (event) => {
			event.stopPropagation();
		});

	// Check to see if the user is signed in.
	if (!user) {
		eventPageApi.stopLoadingAnimation();
		return;
	}

	// Load the user article.
	await loadUserArticle();
	eventPageApi.stopLoadingAnimation();

	// star the article if auto-starring is on
	const extensionOptions = await eventPageApi.getExtensionOptions();
	if (extensionOptions[ExtensionOptionKey.StarOnSave]) {
		await eventPageApi.setStarred({
			articleId: article.id,
			isStarred: true,
		});
	}
}

async function loadUserArticle() {
	// ArticleLookupResult
	const result = await eventPageApi.getUserArticle(
		createPageParseResult(metadataParseResult, contentParseResult)
	);

	// set globals
	article = result.userArticle;
	userPage = result.userPage;
	user = result.user;

	// update the title and byline
	updateArticleHeader({
		title: result.userArticle.title,
		byline: createByline(result.userArticle.articleAuthors),
	});

	// set up the reader
	page = new Page(contentParseResult.primaryTextContainers);
	page.setReadState(result.userPage.readState);
	reader.loadPage(page);
	// re-render ui
	render();

	// load comments or check for bookmark
	if (result.userArticle.isRead) {
		loadComments();
	} else if (page.getBookmarkScrollTop() > window.innerHeight) {
		dialogService.openDialog(
			React.createElement(BookmarkDialog, {
				onClose: dialogService.closeDialog,
				onSubmit: () => {
					const scrollTop = page.getBookmarkScrollTop();
					if (scrollTop > window.innerHeight) {
						contentRoot.style.opacity = '0';
						setTimeout(() => {
							window.scrollTo(0, scrollTop);
							contentRoot.style.opacity = '1';
						}, 350);
					}
					return Promise.resolve();
				},
			})
		);
	}
}

async function unloadUserArticle() {
	// clear the comments
	embedProps.comments = null;

	// reset the reader
	reader.unloadPage();
	page.unload();
	page = null;

	// clear globals
	article = null;
	userPage = null;
	user = null;

	// re-render ui
	render();
}

initialize();

// unload
window.addEventListener('unload', () => {
	eventPageApi.unregisterPage();
});
