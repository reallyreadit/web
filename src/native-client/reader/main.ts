import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import Page from '../../common/reading/Page';
import createPageParseResult from '../../common/reading/createPageParseResult';
import Reader from '../../common/reading/Reader';
import * as ReactDOM from 'react-dom';
import * as  React from 'react';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import { ShareEvent } from '../../common/sharing/ShareEvent';
import CommentThread from '../../common/models/CommentThread';
import { mergeComment, updateComment } from '../../common/comments';
import parseDocumentContent from '../../common/contentParsing/parseDocumentContent';
import styleArticleDocument, { createByline, applyDisplayPreferenceToArticleDocument } from '../../common/reading/styleArticleDocument';
import pruneDocument from '../../common/contentParsing/pruneDocument';
import procesLazyImages from '../../common/contentParsing/processLazyImages';
import { findPublisherConfig } from '../../common/contentParsing/configuration/PublisherConfig';
import configs from '../../common/contentParsing/configuration/configs';
import App, { Props as EmbedProps } from './components/App';
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
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';
import { Message } from '../../common/MessagingContext';
import { parseUrlForRoute } from '../../common/routing/Route';
import ScreenKey from '../../common/routing/ScreenKey';
import { ProblemDetails } from '../../common/ProblemDetails';
import { Result, ResultType } from '../../common/Result';
import { ReadingErrorType } from '../../common/Errors';
import { ReaderSubscriptionPrompt } from '../../common/components/ReaderSubscriptionPrompt';

const messagingContext = new WebViewMessagingContext();

window.reallyreadit = {
	nativeClient: {
		reader: messagingContext.createIncomingMessageHandlers()
	}
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

let
	article: UserArticle,
	displayPreference: DisplayPreference,
	page: Page,
	userPage: UserPage,
	user: UserAccount,
	isWaitingForSubscription = false;

function updateDisplayPreference(preference: DisplayPreference | null) {
	let textSizeChanged = false;
	if (preference) {
		textSizeChanged = (
			displayPreference == null ||
			displayPreference.textSize !== preference.textSize
		);
		displayPreference = preference;
		render();
	}
	applyDisplayPreferenceToArticleDocument(preference);
	if (textSizeChanged && page) {
		page.updateLineHeight();
	}
}

const
	metadataParseResult = parseDocumentMetadata(),
	contentParseResult = parseDocumentContent();

const { contentRoot, scrollRoot } = pruneDocument(contentParseResult);

// hide html element until custom css is applied
document.documentElement.style.transition = 'none';
document.documentElement.style.opacity = '0';

styleArticleDocument({
	title: metadataParseResult.metadata.article.title,
	byline: createByline(metadataParseResult.metadata.article.authors),
	transitionElement: document.documentElement,
	completeTransition: true
});

const publisherConfig = findPublisherConfig(configs.publishers, window.location.hostname);
procesLazyImages(publisherConfig && publisherConfig.imageStrategy);

const reader = new Reader(
	event => {
		messagingContext.sendMessage(
			{
				type: 'commitReadState',
				data: {
					commitData: {
						readState: event.readStateArray,
						userPageId: userPage.id
					},
					isCompletionCommit: event.isCompletionCommit
				}
			},
			(result: Result<UserArticle, ProblemDetails>) => {
				switch (result.type) {
					case ResultType.Success:
						article = result.value;
						if (article.isRead && !embedProps.comments) {
							loadComments();
						} else {
							render();
						}
						break;
					case ResultType.Failure:
						if (result.error.type === ReadingErrorType.SubscriptionRequired && !isWaitingForSubscription) {
							reader.unloadPage();
							dialogService.openDialog(
								React.createElement(
									ReaderSubscriptionPrompt,
									{
										onSubscribe: () => {
											messagingContext.sendMessage({
												type: 'openSubscriptionPrompt'
											});
										}
									}
								)
							);
							isWaitingForSubscription = true;
						}
						break;
				}
			}
		)
	}
);

// document messaging interface
if (/(^|\.)readup\.com$/.test(window.location.hostname)) {
	const postScript = document.querySelector('#com_readup_blog_post_script script');
	if (postScript) {
		// the browser won't execute the script if we just alter the type attribute.
		// we have to create a new script element.
		const replacementScript = document.createElement('script');
		replacementScript.textContent = postScript.textContent;
		postScript.replaceWith(replacementScript);
	}
}
window.addEventListener(
	'message',
	event => {
		if (!event.origin.endsWith('readup.com')) {
			return;
		}
		switch (event.data?.type as String || null) {
			case 'toggleVisualDebugging':
				page.toggleVisualDebugging();
				break;
		}
	}
);

// handle article and embed links
function handleLink(url: string) {
	const result = parseUrlForRoute(url);
	if (result.isInternal && result.route) {
		if (result.route.screenKey === ScreenKey.Read) {
			const params = result.route.getPathParams(result.url.pathname);
			readArticle(params['sourceSlug'] + '_' + params['articleSlug']);
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
	if (
		this.hasAttribute('href')
	) {
		handleLink(this.href);
	}
}
Array
	.from(
		document.getElementsByTagName('a')
	)
	.forEach(
		anchor => {
			anchor.addEventListener('click', handleArticleLink);
		}
	);

// user interface
const dialogService = new DialogService({
	setState: (delegate, callback) => {
		render(
			delegate(embedProps),
			callback
		);
	}
});
let
	embedProps: Pick<EmbedProps, Exclude<keyof EmbedProps, 'article' | 'displayPreference' | 'user'>> = {
		comments: null,
		dialogs: [],
		dialogService,
		isHeaderHidden: false,
		onChangeDisplayPreference: changeDisplayPreference,
		onDeleteComment: deleteComment,
		onLinkAuthServiceAccount: linkAuthServiceAccount,
		onNavBack: navBack,
		onNavTo: handleLink,
		onPostArticle: postArticle,
		onPostComment: postComment,
		onPostCommentAddendum: postCommentAddendum,
		onPostCommentRevision: postCommentRevision,
		onReportArticleIssue: reportArticleIssue,
		onShare: share
	},
	embedRootElement: HTMLDivElement;
function insertEmbed() {
	// create root element
	embedRootElement = window.document.createElement('div');
	embedRootElement.id = 'com_readup_embed';
	scrollRoot.append(embedRootElement);
	// initial render
	render();
	// create scroll service
	const scrollService = new ScrollService({
		scrollContainer: window,
		setBarVisibility: isVisible => {
			if (isVisible === embedProps.isHeaderHidden) {
				setStatusBarVisibility(isVisible);
				render({
					isHeaderHidden: !isVisible
				});
			}
		}
	});
	// add click listener to toggle header
	contentRoot.addEventListener(
		'click',
		() => {
			const isHeaderHidden = !embedProps.isHeaderHidden;
			scrollService.setBarVisibility(!isHeaderHidden);
			setStatusBarVisibility(!isHeaderHidden);
			render({
				isHeaderHidden
			});
		}
	);
}
function render(props?: Partial<Pick<EmbedProps, Exclude<keyof EmbedProps, 'article' | 'user'>>>, callback?: () => void) {
	ReactDOM.render(
		React.createElement(
			App,
			{
				...(
					embedProps = {
						...embedProps,
						...props
					}
				),
				article: {
					isLoading: !article,
					value: article
				},
				displayPreference,
				user
			}
		),
		embedRootElement,
		callback
	);
}

function linkAuthServiceAccount(provider: AuthServiceProvider) {
	return new Promise<TwitterRequestToken>(
			resolve => {
				messagingContext.sendMessage(
					{
						type: 'requestTwitterWebViewRequestToken'
					},
					resolve
				);
			}
		)
		.then(
			token => new Promise<WebAuthResponse>(
				resolve => {
					const url = new URL('https://api.twitter.com/oauth/authorize');
					url.searchParams.set('oauth_token', token.value);
					messagingContext.sendMessage(
						{
							type: 'requestWebAuthentication',
							data: {
								authUrl: url.href,
								callbackScheme: 'readup'
							}
						},
						resolve
					);
				}
			)
		)
		.then(
			webAuthResponse => new Promise<AuthServiceAccountAssociation>(
				(resolve, reject) => {
					if (!webAuthResponse.callbackURL) {
						if (webAuthResponse.error === 'Unsupported') {
							dialogService.openDialog(
								React.createElement(
									UpdateRequiredDialog,
									{
										message: 'You can link your Twitter account on the Readup website instead.',
										onClose: dialogService.closeDialog,
										updateType: 'ios',
										versionRequired: '13'
									}
								),
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
								oauthVerifier: url.searchParams.get('oauth_verifier')
							}
						},
						resolve
					);
				}
			)
			.then(
				association => {
					if (!user.hasLinkedTwitterAccount) {
						user = {
							...user,
							hasLinkedTwitterAccount: true
						};
						render();
					}
					return association;
				}
			)
		);
}

function loadComments() {
	render({
		comments: {
			isLoading: true
		}
	});
	messagingContext.sendMessage(
		{
			type: 'getComments',
			data: article.slug
		},
		(comments: CommentThread[]) => {
			render({
				comments: {
					isLoading: false,
					value: comments
				}
			});
		}
	);
}

function navBack() {
	messagingContext.sendMessage({
		type: 'navBack'
	});
}

function navTo(url: string) {
	messagingContext.sendMessage({
		type: 'navTo',
		data: url
	});
}

function openExternalUrl(url: string) {
	messagingContext.sendMessage({
		type: 'openExternalUrl',
		data: url
	});
}

function postArticle(form: PostForm) {
	return new Promise<Post>(
		resolve => {
			messagingContext.sendMessage(
				{
					type: 'postArticle',
					data: form
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
								)
							}
						});
					} else {
						render();
					}
					resolve(post);
				}
			);
		}
	);
}

function postComment(form: CommentForm) {
	return new Promise<void>(resolve => {
		messagingContext.sendMessage(
			{
				type: 'postComment',
				data: form
			},
			(result: { article: UserArticle, comment: CommentThread }) => {
				resolve();
				article = result.article;
				render({
					comments: {
						...embedProps.comments,
						value: mergeComment(result.comment, embedProps.comments.value)
					}
				});
			}
		);
	});
}

function postCommentAddendum(form: CommentAddendumForm) {
	return new Promise<CommentThread>(
		resolve => {
			messagingContext.sendMessage(
				{
					type: 'postCommentAddendum',
					data: form
				},
				(comment: CommentThread) => {
					render({
						comments: {
							...embedProps.comments,
							value: updateComment(comment, embedProps.comments.value)
						}
					});
					resolve(comment);
				}
			);
		}
	);
}

function postCommentRevision(form: CommentRevisionForm) {
	return new Promise<CommentThread>(
		resolve => {
			messagingContext.sendMessage(
				{
					type: 'postCommentRevision',
					data: form
				},
				(comment: CommentThread) => {
					render({
						comments: {
							...embedProps.comments,
							value: updateComment(comment, embedProps.comments.value)
						}
					});
					resolve(comment);
				}
			);
		}
	);
}

function reportArticleIssue(request: ArticleIssueReportRequest) {
	messagingContext.sendMessage({
		type: 'reportArticleIssue',
		data: request
	});
}

function changeDisplayPreference(preference: DisplayPreference) {
	updateDisplayPreference(preference);
	return new Promise<DisplayPreference>(
		resolve => {
			messagingContext.sendMessage(
				{
					type: 'changeDisplayPreference',
					data: preference
				},
				(preference: DisplayPreference) => {
					resolve(preference);
				}
			);
		}
	);
}

function deleteComment(form: CommentRevisionForm) {
	return new Promise<CommentThread>(
		resolve => {
			messagingContext.sendMessage(
				{
					type: 'deleteComment',
					data: form
				},
				(comment: CommentThread) => {
					render({
						comments: {
							...embedProps.comments,
							value: updateComment(comment, embedProps.comments.value)
						}
					});
					resolve(comment);
				}
			);
		}
	);
}

function readArticle(slug: string) {
	messagingContext.sendMessage({
		type: 'readArticle',
		data: slug
	});
}

function setStatusBarVisibility(isVisible: boolean) {
	messagingContext.sendMessage({
		type: 'setStatusBarVisibility',
		data: isVisible
	});
}


function share(data: ShareEvent) {
	messagingContext.sendMessage({
		type: 'share',
		data
	});
}

insertEmbed();

messagingContext.sendMessage(
	{
		type: 'getDisplayPreference'
	},
	(preference: DisplayPreference | null) => {
		// update the display preference
		// this version is loaded from local storage. prefer an existing copy
		// that would have been set by an external change event.
		if (!displayPreference) {
			updateDisplayPreference(preference);
		}
		// send parse result
		messagingContext.sendMessage(
			{
				type: 'parseResult',
				data: createPageParseResult(metadataParseResult, contentParseResult)
			},
			(result: ArticleLookupResult) => {
				// set globals
				article = result.userArticle;
				userPage = result.userPage;
				user = result.user;
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
						React.createElement(
							BookmarkDialog,
							{
								onClose: dialogService.closeDialog,
								onSubmit: () => {
									const scrollTop = page.getBookmarkScrollTop();
									if (scrollTop > window.innerHeight) {
										contentRoot.style.opacity = '0';
										setTimeout(
											() => {
												window.scrollTo(0, scrollTop);
												contentRoot.style.opacity = '1';
											},
											350
										);
									}
									return Promise.resolve();
								}
							}
						)
					);
				}
			}
		);
	}
);