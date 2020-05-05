import ReadStateCommitData from '../../common/reading/ReadStateCommitData';
import ParseResult from '../../common/reading/ParseResult';
import ArticleLookupResult from '../../common/models/ArticleLookupResult';
import UserArticle from '../../common/models/UserArticle';
import CommentThread from '../../common/models/CommentThread';
import CommentForm from '../../common/models/social/CommentForm';
import ArticleUpdatedEvent from '../../common/models/ArticleUpdatedEvent';
import PostForm from '../../common/models/social/PostForm';
import Post from '../../common/models/social/Post';
import CommentAddendumForm from '../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../common/models/social/CommentDeletionForm';
import { createMessageResponseHandler } from '../common/messaging';
import StarForm from '../../common/models/articles/StarForm';
import SetStore from '../../common/webStorage/SetStore';
import { Message } from '../../common/MessagingContext';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import { calculateEstimatedReadTime } from '../../common/calculate';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import TwitterRequestToken from '../../common/models/auth/TwitterRequestToken';
import UserAccount from '../../common/models/UserAccount';
import WindowOpenRequest from '../common/WindowOpenRequest';
import ArticleIssueReportRequest from '../../common/models/analytics/ArticleIssueReportRequest';

interface ReaderContentScriptTab {
	articleId: number | null,
	id: number
}
export default class ReaderContentScriptApi {
	private readonly _badge = new BrowserActionBadgeApi();
	private readonly _tabs = new SetStore<number, ReaderContentScriptTab>('readerTabs', t => t.id, 'localStorage');
	constructor(
		handlers: {
			onRegisterPage: (tabId: number, data: ParseResult) => Promise<ArticleLookupResult>,
			onCommitReadState: (tabId: number, commitData: ReadStateCommitData, isCompletionCommit: boolean) => Promise<UserArticle>,
			onLoadContentParser: (tabId: number) => void,
			onGetComments: (slug: string) => Promise<CommentThread[]>,
			onPostArticle: (form: PostForm) => Promise<Post>,
			onPostComment: (form: CommentForm) => Promise<{ article: UserArticle, comment: CommentThread }>,
			onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
			onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
			onReportArticleIssue: (request: ArticleIssueReportRequest) => Promise<void>,
			onRequestTwitterBrowserLinkRequestToken: () => Promise<TwitterRequestToken>,
			onSetStarred: (form: StarForm) => Promise<UserArticle>,
			onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>
		}
	) {
		// listen for messages from content script
		chrome.runtime.onMessage.addListener(
			(message, sender, sendResponse) => {
				if (message.to === 'eventPage' && message.from === 'readerContentScript') {
					console.log(`[ReaderApi] received ${message.type} message from tab # ${sender.tab?.id}`);
					switch (message.type) {
						case 'registerPage':
							this._tabs.set({
								articleId: null,
								id: sender.tab.id
							});
							this._badge.setLoading(sender.tab.id);
							createMessageResponseHandler(
								handlers
									.onRegisterPage(sender.tab.id, message.data)
									.then(
										result => {
											this._tabs.set({
												articleId: result.userArticle.id,
												id: sender.tab.id
											});
											this._tabs
												.getAll()
												.forEach(
													tab => {
														if (tab.articleId === result.userArticle.id) {
															this._badge.setReading(tab.id, result.userArticle);
															chrome.browserAction.setTitle({
																tabId: tab.id,
																title: `${calculateEstimatedReadTime(result.userArticle.wordCount)} min. read`
															});
														}
													}
												);
											return result;
										}
									)
									.catch(
										error => {
											this._tabs.remove(sender.tab.id);
											this._badge.setDefault(sender.tab.id);
											throw error;
										}
									),
								sendResponse
							);
							return true;
						case 'commitReadState':
							createMessageResponseHandler(
								handlers
									.onCommitReadState(sender.tab.id, message.data.commitData, message.data.isCompletionCommit)
									.then(
										article => {
											this._tabs
												.getAll()
												.forEach(
													tab => {
														if (tab.articleId === article.id) {
															this._badge.setReading(tab.id, article);
														}
													}
												);
											return article;
										}
									),
								sendResponse
							);
							return true;
						case 'unregisterPage':
							// sender.tab.id is undefined in Firefox
							// tab won't be removed until a messaging error occurs
							this._tabs.remove(sender.tab.id);
							break;
						case 'loadContentParser':
							handlers.onLoadContentParser(sender.tab.id);
							break;
						case 'closeWindow':
							chrome.windows.remove(
								(message.data as number),
								() => {
									if (chrome.runtime.lastError) {
										console.log(`[ReaderApi] error closing window, message: ${chrome.runtime.lastError.message}`);
									}
								}
							);
							break;
						case 'getComments':
							createMessageResponseHandler(
								handlers.onGetComments(message.data),
								sendResponse
							);
							return true;
						case 'hasWindowClosed':
							createMessageResponseHandler(
								new Promise<boolean>(
									(resolve, reject) => {
										chrome.windows.get(
											(message.data as number),
											chromeWindow => {
												if (chrome.runtime.lastError) {
													console.log(`[ReaderApi] error getting window, message: ${chrome.runtime.lastError.message}`);
												}
												resolve(!chromeWindow);
											}
										);
									}
								),
								sendResponse
							);
							return true;
						case 'openWindow':
							const request = (message.data as WindowOpenRequest);
							createMessageResponseHandler(
								new Promise<number>(
									(resolve, reject) => {
										chrome.windows.create(
											{
												type: 'popup',
												url: request.url,
												width: request.width,
												height: request.height,
												focused: true,
											},
											chromeWindow => {
												if (chrome.runtime.lastError) {
													console.log(`[ReaderApi] error opening window, message: ${chrome.runtime.lastError.message}`);
													reject(chrome.runtime.lastError);
													return;
												}
												resolve(chromeWindow.id);
											}
										);
									}
								),
								sendResponse
							);
							return true;
						case 'postArticle':
							createMessageResponseHandler(
								handlers.onPostArticle(message.data),
								sendResponse
							);
							return true;
						case 'postComment':
							createMessageResponseHandler(
								handlers.onPostComment(message.data),
								sendResponse
							);
							return true;
						case 'postCommentAddendum':
							createMessageResponseHandler(
								handlers.onPostCommentAddendum(message.data),
								sendResponse
							);
							return true;
						case 'postCommentRevision':
							createMessageResponseHandler(
								handlers.onPostCommentRevision(message.data),
								sendResponse
							);
							return true;
						case 'reportArticleIssue':
							createMessageResponseHandler(
								handlers.onReportArticleIssue(message.data),
								sendResponse
							);
							return true;
						case 'requestTwitterBrowserLinkRequestToken':
							createMessageResponseHandler(
								handlers.onRequestTwitterBrowserLinkRequestToken(),
								sendResponse
							);
							return true;
						case 'setStarred':
							createMessageResponseHandler(
								handlers.onSetStarred(message.data),
								sendResponse
							);
							return true;
						case 'deleteComment':
							createMessageResponseHandler(
								handlers.onDeleteComment(message.data),
								sendResponse
							);
							return true;
					}
				}
				return false;
			}
		);
	}
	private broadcastMessage<T>(articleId: number, message: Message) {
		this._tabs
			.getAll()
			.forEach(
				tab => {
					if (articleId == null || tab.articleId === articleId) {
						console.log(`[ReaderApi] sending ${message.type} message to tab # ${tab.id}`);
						chrome.tabs.sendMessage(
							tab.id,
							message,
							() => {
								if (chrome.runtime.lastError) {
									console.log(`[ReaderApi] error sending message to tab # ${tab.id}, message: ${chrome.runtime.lastError.message}`);
									this._tabs.remove(tab.id);
								}
							}
						);
					}
				}
			);
	}
	public articleUpdated(event: ArticleUpdatedEvent) {
		this.broadcastMessage(
			event.article.id,
			{
				type: 'articleUpdated',
				data: event
			}
		);
	}
	public authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse) {
		this.broadcastMessage(
			null,
			{
				type: 'authServiceLinkCompleted',
				data: response
			}
		);
	}
	public clearTabs() {
		this._tabs.clear();
	}
	public commentPosted(comment: CommentThread) {
		this.broadcastMessage(
			comment.articleId,
			{
				type: 'commentPosted',
				data: comment
			}
		);
	}
	public commentUpdated(comment: CommentThread) {
		this.broadcastMessage(
			comment.articleId,
			{
				type: 'commentUpdated',
				data: comment
			}
		);
	}
	public userSignedOut() {
		this.broadcastMessage(
			null,
			{
				type: 'userSignedOut'
			}
		);
		this._tabs
			.getAll()
			.forEach(
				tab => {
					this._badge.setDefault(tab.id);
				}
			);
		this._tabs.clear();
	}
	public userUpdated(user: UserAccount) {
		this.broadcastMessage(
			null,
			{
				type: 'userUpdated',
				data: user
			}
		);
	}
}