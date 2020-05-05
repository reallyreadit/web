import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import Page from '../../common/reading/Page';
import ContentElement from '../../common/reading/ContentElement';
import createPageParseResult from '../../common/reading/createPageParseResult';
import Reader from '../../common/reading/Reader';
import * as ReactDOM from 'react-dom';
import * as  React from 'react';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import ShareData from '../../common/sharing/ShareData';
import CommentThread from '../../common/models/CommentThread';
import { mergeComment, updateComment } from '../../common/comments';
import parseDocumentContent from '../../common/contentParsing/parseDocumentContent';
import styleArticleDocument, { createByline } from '../../common/reading/styleArticleDocument';
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

const messagingContext = new WebViewMessagingContext();

window.reallyreadit = {
	nativeClient: {
		reader: messagingContext.createIncomingMessageHandlers()
	}
};

let
	article: UserArticle,
	userPage: UserPage,
	user: UserAccount;

const
	metadataParseResult = parseDocumentMetadata(),
	contentParseResult = parseDocumentContent(),
	page = new Page(
		contentParseResult.primaryTextContainers.map(container => new ContentElement(container.containerElement as HTMLElement, container.wordCount))
	);

pruneDocument(contentParseResult);
styleArticleDocument(
	window.document,
	metadataParseResult.metadata.article.title,
	createByline(metadataParseResult.metadata.article.authors)
);

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
			(updatedArticle: UserArticle) => {
				article = updatedArticle;
				if (article.isRead && !embedProps.comments) {
					loadComments();
				} else {
					render();
				}
			}
		)
	}
);

// user interface
const dialogService = new DialogService({
	setState: delegate => {
		render(delegate(embedProps));
	}
});
let
	embedProps: Pick<EmbedProps, Exclude<keyof EmbedProps, 'article' | 'user'>> = {
		comments: null,
		dialogs: [],
		dialogService,
		isHeaderHidden: false,
		onDeleteComment: deleteComment,
		onLinkAuthServiceAccount: linkAuthServiceAccount,
		onNavBack: navBack,
		onNavTo: navTo,
		onOpenExternalUrl: openExternalUrl,
		onPostArticle: postArticle,
		onPostComment: postComment,
		onPostCommentAddendum: postCommentAddendum,
		onPostCommentRevision: postCommentRevision,
		onReadArticle: readArticle,
		onReportArticleIssue: reportArticleIssue,
		onShare: share
	},
	embedRootElement: HTMLDivElement;
function insertEmbed() {
	// create root element
	embedRootElement = window.document.createElement('div');
	embedRootElement.id = 'com_readup_embed';
	window.document.body.append(embedRootElement);
	// initial render
	render();
	// create scroll service
	const scrollService = new ScrollService({
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
	document
		.getElementById('com_readup_article_content')
		.addEventListener(
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
function render(props?: Partial<Pick<EmbedProps, Exclude<keyof EmbedProps, 'article' | 'user'>>>) {
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
				user
			}
		),
		embedRootElement
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


function share(data: ShareData) {
	messagingContext.sendMessage({
		type: 'share',
		data
	});
}

insertEmbed();

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
								const content = document.getElementById('com_readup_article_content');
								content.style.opacity = '0';
								setTimeout(
									() => {
										window.scrollTo(0, scrollTop);
										content.style.opacity = '1';
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