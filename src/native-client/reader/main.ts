// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import Page from '../../common/reading/Page';
import createPageParseResult from '../../common/reading/createPageParseResult';
import Reader from '../../common/reading/Reader';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import { ShareEvent } from '../../common/sharing/ShareEvent';
import CommentThread from '../../common/models/CommentThread';
import { mergeComment, updateComment } from '../../common/comments';
import parseDocumentContent from '../../common/contentParsing/parseDocumentContent';
import styleArticleDocument, {
	createByline,
	applyDisplayPreferenceToArticleDocument,
	updateArticleHeader,
} from '../../common/reading/styleArticleDocument';
import pruneDocument from '../../common/contentParsing/pruneDocument';
import procesLazyImages from '../../common/contentParsing/processLazyImages';
import { findPublisherConfig } from '../../common/contentParsing/configuration/PublisherConfig';
import configs from '../../common/contentParsing/configuration/configs';
import ReaderUIEmbed, {
	Props as EmbedProps,
} from '../../common/reader-app/ReaderUIEmbed';
import PostForm from '../../common/models/social/PostForm';
import Post, { createCommentThread } from '../../common/models/social/Post';
import CommentForm from '../../common/models/social/CommentForm';
import CommentAddendumForm from '../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../common/models/social/CommentRevisionForm';
import AuthServiceProvider from '../../common/models/auth/AuthServiceProvider';
import TwitterRequestToken from '../../common/models/auth/TwitterRequestToken';
import WebAuthResponse from '../../common/models/app/WebAuthResponse';
import AuthServiceAccountAssociation from '../../common/models/auth/AuthServiceAccountAssociation';
import DialogService from '../../common/services/DialogService';
import UpdateRequiredDialog from '../../common/components/UpdateRequiredDialog';
import BookmarkDialog from '../../common/components/BookmarkDialog';
import UserPage from '../../common/models/UserPage';
import UserAccount from '../../common/models/UserAccount';
import ScrollService from '../../common/services/ScrollService';
import ArticleIssueReportRequest from '../../common/models/analytics/ArticleIssueReportRequest';
import DisplayPreference, { getClientDefaultDisplayPreference } from '../../common/models/userAccounts/DisplayPreference';
import { Message } from '../../common/MessagingContext';
import { parseUrlForRoute } from '../../common/routing/Route';
import ScreenKey from '../../common/routing/ScreenKey';
import { ProblemDetails, HttpProblemDetails } from '../../common/ProblemDetails';
import { Result, ResultType } from '../../common/Result';
import { createArticleSlug } from '../../common/routing/routes';
import { parseQueryString } from '../../common/routing/queryString';
import { ParserDocumentLocation } from '../../common/ParserDocumentLocation';
import ShareResponse from '../../common/sharing/ShareResponse';
import { DeviceType } from '../../common/DeviceType';
import { AppPlatform } from '../../common/AppPlatform';
import { createUrl } from '../../common/HttpEndpoint';
import ReaderReminder from '../../common/components/ReaderReminder';
import { AuthenticationMethod } from '../../common/models/auth/AuthenticationRequest';
import Fetchable from '../../common/Fetchable';
import { getPromiseErrorMessage } from '../../common/format';

const initData = window.reallyreadit.nativeClient.reader.initData;

// On iOS window.location will be set to the article's URL but in Electron it will be a file: URL
// with the article's URL provided as a query parameter.
let documentLocation: ParserDocumentLocation;
if (window.location.protocol === 'file:') {
	documentLocation = new URL(parseQueryString(window.location.search)['url']);
} else {
	documentLocation = window.location;
}

// TODO: Shared components should no longer rely on DeviceType. For now we'll approximate using AppPlatform.
let deviceType: DeviceType;
switch (initData.appPlatform) {
	case AppPlatform.Android:
		deviceType = DeviceType.Android;
		break;
	case AppPlatform.Ios:
	case AppPlatform.MacOs:
		deviceType = DeviceType.Ios;
		break;
	case AppPlatform.Linux:
	case AppPlatform.Windows:
		deviceType = DeviceType.DesktopChrome;
		break;
}

const messagingContext = new WebViewMessagingContext();

window.reallyreadit = {
	...window.reallyreadit,
	nativeClient: {
		...window.reallyreadit.nativeClient,
		reader: {
			...window.reallyreadit.nativeClient.reader,
			...messagingContext.createIncomingMessageHandlers(),
		},
	},
};

messagingContext.addListener(
	(message: Message, sendResponse: (data: any) => void) => {
		switch (message.type) {
			case 'displayPreferenceChanged':
				updateDisplayPreference(message.data);
				break;
		}
	}
);

let article: UserArticle,
	displayPreference = initData.displayPreference || getClientDefaultDisplayPreference(),
	page: Page | null,
	userPage: UserPage | null,
	user: UserAccount | null;

/**
 * Let the components in this reader know that the display preference has changed,
 * following an external or internal action.
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
	if (textSizeChanged && page) {
		page.updateLineHeight();
	}
}

const metadataParseResult = parseDocumentMetadata({
		url: documentLocation,
	}),
	contentParseResult = parseDocumentContent({
		url: documentLocation,
	});

const { contentRoot, scrollRoot } = pruneDocument(contentParseResult);

// hide html element until custom css is applied
document.documentElement.style.transition = 'none';
document.documentElement.style.opacity = '0';

styleArticleDocument({
	header: {
		title: metadataParseResult.metadata.article.title,
		byline: createByline(metadataParseResult.metadata.article.authors),
	},
	transitionElement: document.documentElement,
});

const publisherConfig = findPublisherConfig(
	configs.publishers,
	documentLocation.hostname
);
procesLazyImages(publisherConfig && publisherConfig.imageStrategy);

const reader = new Reader((event) => {
	messagingContext.sendMessage(
		{
			type: 'commitReadState',
			data: {
				commitData: {
					readState: event.readStateArray,
					userPageId: userPage.id,
				},
				isCompletionCommit: event.isCompletionCommit,
			},
		},
		(result: Result<UserArticle, ProblemDetails>) => {
			switch (result.type) {
				case ResultType.Success:
					article = result.value;
					render();
					break;
			}
		}
	);
});

// document messaging interface
window.addEventListener('message', (event) => {
	if (!/(^|\.)readup\.org$/.test(documentLocation.hostname)) {
		return;
	}
	switch ((event.data?.type as String) || null) {
		case 'toggleVisualDebugging':
			page.toggleVisualDebugging();
			break;
	}
});

// handle article and embed links
function handleLink(url: string) {
	const result = parseUrlForRoute(url);
	if (result.isInternal && result.route) {
		if (result.route.screenKey === ScreenKey.Read) {
			readArticle(
				createArticleSlug(result.route.getPathParams(result.url.pathname))
			);
		} else {
			navTo(result.url.href);
		}
		return true;
	} else if (!result.isInternal && result.url) {
		openExternalUrl(result.url.href);
		return true;
	}
	return false;
}

function handleArticleLink(this: HTMLAnchorElement, ev: MouseEvent) {
	ev.preventDefault();
	if (this.hasAttribute('href')) {
		handleLink(this.href);
	}
}

Array.from(document.getElementsByTagName('a')).forEach((anchor) => {
	anchor.addEventListener('click', handleArticleLink);
});

// user interface
const dialogService = new DialogService({
	setState: (delegate, callback) => {
		render(delegate(embedProps), callback);
	},
});

function onCreateAbsoluteUrl(path: string) {
	return createUrl(
		window.reallyreadit.nativeClient.reader.config.webServer,
		path
	);
}

let embedProps: Pick<
		EmbedProps,
		Exclude<keyof EmbedProps, 'article' | 'displayPreference' | 'user'>
	> = {
		appPlatform: initData.appPlatform,
		comments: null,
		deviceType,
		dialogs: [],
		dialogService,
		isHeaderHidden: false,
		onChangeDisplayPreference: changeDisplayPreference,
		onCreateAbsoluteUrl,
		onDeleteComment: deleteComment,
		onLinkAuthServiceAccount: linkAuthServiceAccount,
		onNavBack: navBack,
		onNavTo: handleLink,
		onPostArticle: postArticle,
		onPostComment: postComment,
		onPostCommentAddendum: postCommentAddendum,
		onPostCommentRevision: postCommentRevision,
		onReportArticleIssue: reportArticleIssue,
		onShare: share,
		onToggleStar: toggleStar,
	},
	embedRootElement: HTMLDivElement;
// This is the props object and container element for the sign-in reminder react component.
const reminderProps = {
	onSignIn: () => {
		messagingContext.sendMessage({
			type: 'authenticate',
			data: {
				method: AuthenticationMethod.SignIn
			}
		});
	},
	onDismiss: async (disableReminder: boolean) => {
		reminderState.isDismissed = true;
		if (disableReminder) {
			messagingContext.sendMessage({
				type: 'disableSignInReminder'
			});
			reminderState.isDisabled = true;
		}
		render();
	}
};
let reminderState = {
	// This is the in-memory ephemeral preference for this reader view.
	isDismissed: false,
	// This is synced from the preference persisted to device storage.
	isDisabled: initData.isSignInReminderDisabled
};
let reminderRootElement: HTMLDivElement;

/**
 * Inserts an element in the document that contains an attachment point for ReaderUIEmbed.tsx via render(),
 * which is thehost for reader-related UI & behavior.
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
				setStatusBarVisibility(isVisible);
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
		setStatusBarVisibility(!isHeaderHidden);
		render({
			isHeaderHidden,
		});
	});
}
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
			new Promise(resolve => {
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
					callback
				);
			}),
			new Promise(
				resolve => {
					ReactDOM.render(
						React.createElement(
							ReaderReminder,
							{
								...reminderProps,
								isActive: !initData.isAuthenticated && !reminderState.isDismissed && !reminderState.isDisabled
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

function linkAuthServiceAccount(provider: AuthServiceProvider) {
	return new Promise<TwitterRequestToken>((resolve) => {
		messagingContext.sendMessage(
			{
				type: 'requestTwitterWebViewRequestToken',
			},
			resolve
		);
	})
		.then(
			(token) =>
				new Promise<WebAuthResponse>((resolve) => {
					const url = new URL('https://api.twitter.com/oauth/authorize');
					url.searchParams.set('oauth_token', token.value);
					messagingContext.sendMessage(
						{
							type: 'requestWebAuthentication',
							data: {
								authUrl: url.href,
								callbackScheme: 'readup',
							},
						},
						resolve
					);
				})
		)
		.then((webAuthResponse) =>
			new Promise<AuthServiceAccountAssociation>((resolve, reject) => {
				if (!webAuthResponse.callbackURL) {
					if (webAuthResponse.error === 'Unsupported') {
						dialogService.openDialog(
							React.createElement(UpdateRequiredDialog, {
								message:
									'You can link your Twitter account on the Readup website instead.',
								onClose: dialogService.closeDialog,
								updateType: 'ios',
								versionRequired: '13',
							}),
							'push'
						);
					}
					reject(new Error(webAuthResponse.error ?? 'Unknown'));
					return;
				}
				const url = new URL(webAuthResponse.callbackURL);
				if (url.searchParams.has('denied')) {
					reject(new Error('Cancelled'));
					return;
				}
				messagingContext.sendMessage(
					{
						type: 'linkTwitterAccount',
						data: {
							oauthToken: url.searchParams.get('oauth_token'),
							oauthVerifier: url.searchParams.get('oauth_verifier'),
						},
					},
					resolve
				);
			}).then((association) => {
				if (!user.hasLinkedTwitterAccount) {
					user = {
						...user,
						hasLinkedTwitterAccount: true,
					};
					render();
				}
				return association;
			})
		);
}

function loadComments() {
	render({
		comments: {
			isLoading: true,
		},
	});
	messagingContext.sendMessage(
		{
			type: 'getComments',
			data: article != null ?
				{
					slug: article.slug
				} :
				{
					url: documentLocation.href
				}
		},
		(result: Result<CommentThread[], HttpProblemDetails>) => {
			const comments: Fetchable<CommentThread[]> = {
				isLoading: false
			};
			switch (result.type) {
				case ResultType.Success:
					comments.value = result.value;
					break;
				case ResultType.Failure:
					if (result.error.status === 404) {
						comments.value = [];
					} else {
						comments.errors = [getPromiseErrorMessage(result.error)];
					}
					break;
			}
			render({ comments });
		}
	);
}

function navBack() {
	messagingContext.sendMessage({
		type: 'navBack',
	});
}

function navTo(url: string) {
	messagingContext.sendMessage({
		type: 'navTo',
		data: url,
	});
}

function openExternalUrl(url: string) {
	messagingContext.sendMessage({
		type: 'openExternalUrl',
		data: url,
	});
}

function postArticle(form: PostForm) {
	return new Promise<Post>((resolve) => {
		messagingContext.sendMessage(
			{
				type: 'postArticle',
				data: form,
			},
			(post: Post) => {
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
				resolve(post);
			}
		);
	});
}

function postComment(form: CommentForm) {
	return new Promise<void>((resolve) => {
		messagingContext.sendMessage(
			{
				type: 'postComment',
				data: form,
			},
			(result: { article: UserArticle; comment: CommentThread }) => {
				resolve();
				article = result.article;
				render({
					comments: {
						...embedProps.comments,
						value: mergeComment(result.comment, embedProps.comments.value),
					},
				});
			}
		);
	});
}

function postCommentAddendum(form: CommentAddendumForm) {
	return new Promise<CommentThread>((resolve) => {
		messagingContext.sendMessage(
			{
				type: 'postCommentAddendum',
				data: form,
			},
			(comment: CommentThread) => {
				render({
					comments: {
						...embedProps.comments,
						value: updateComment(comment, embedProps.comments.value),
					},
				});
				resolve(comment);
			}
		);
	});
}

function postCommentRevision(form: CommentRevisionForm) {
	return new Promise<CommentThread>((resolve) => {
		messagingContext.sendMessage(
			{
				type: 'postCommentRevision',
				data: form,
			},
			(comment: CommentThread) => {
				render({
					comments: {
						...embedProps.comments,
						value: updateComment(comment, embedProps.comments.value),
					},
				});
				resolve(comment);
			}
		);
	});
}

function reportArticleIssue(request: ArticleIssueReportRequest) {
	messagingContext.sendMessage({
		type: 'reportArticleIssue',
		data: request,
	});
}

function changeDisplayPreference(preference: DisplayPreference) {
	updateDisplayPreference(preference);
	return new Promise<DisplayPreference>((resolve) => {
		messagingContext.sendMessage(
			{
				type: 'changeDisplayPreference',
				data: preference,
			},
			(preference: DisplayPreference) => {
				resolve(preference);
			}
		);
	});
}

function deleteComment(form: CommentRevisionForm) {
	return new Promise<CommentThread>((resolve) => {
		messagingContext.sendMessage(
			{
				type: 'deleteComment',
				data: form,
			},
			(comment: CommentThread) => {
				render({
					comments: {
						...embedProps.comments,
						value: updateComment(comment, embedProps.comments.value),
					},
				});
				resolve(comment);
			}
		);
	});
}

function readArticle(slug: string) {
	messagingContext.sendMessage({
		type: 'readArticle',
		data: slug,
	});
}

function setStatusBarVisibility(isVisible: boolean) {
	messagingContext.sendMessage({
		type: 'setStatusBarVisibility',
		data: isVisible,
	});
}

function share(data: ShareEvent): ShareResponse {
	messagingContext.sendMessage({
		type: 'share',
		data,
	});

	return {
		channels: [],
	};
}

function toggleStar() {
	return new Promise<void>((resolve, reject) => {
		messagingContext.sendMessage(
			{
				type: article.dateStarred ? 'unstarArticle' : 'starArticle',
				data: {
					articleId: article.id,
				},
			},
			(result: UserArticle) => {
				if (result) {
					article = result;
					render();
					resolve();
				} else {
					reject();
				}
			}
		);
	});
}

insertEmbed();

updateDisplayPreference(displayPreference);

document.documentElement.style.transition = 'opacity 350ms';
document.documentElement.style.opacity = '1';

// Set up the comments loading observer. This should happen after the article text is fully rendered so that the observer doesn't fire immediately.
const embedElementObserver = new IntersectionObserver(
	(entries, observer) => {
		const entry = entries[0];
		if (!entry) {
			return;
		}
		if (entry.isIntersecting) {
			observer.unobserve(entry.target);
			loadComments();
		}
	}
);
embedElementObserver.observe(embedRootElement);

// send parse result
messagingContext.sendMessage(
	{
		type: 'parseResult',
		data: createPageParseResult(metadataParseResult, contentParseResult),
	},
	(result: ArticleLookupResult | null) => {
		if (!initData.isAuthenticated) {
			return;
		}
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
		// check for bookmark
		if (page.getBookmarkScrollTop() > window.innerHeight) {
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
);
