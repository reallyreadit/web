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
import { Message } from '../../common/MessagingContext';
import BrowserActionBadgeApi from './BrowserActionBadgeApi';
import { calculateEstimatedReadTime } from '../../common/calculate';
import { AuthServiceBrowserLinkResponse } from '../../common/models/auth/AuthServiceBrowserLinkResponse';
import TwitterRequestToken from '../../common/models/auth/TwitterRequestToken';
import UserAccount from '../../common/models/UserAccount';
import WindowOpenRequest from '../common/WindowOpenRequest';
import ArticleIssueReportRequest from '../../common/models/analytics/ArticleIssueReportRequest';
import DisplayPreference from '../../common/models/userAccounts/DisplayPreference';

interface ReaderContentScriptTab {
	articleId: number | null;
	id: number;
}

/**
 * An API for the event (background) scripts to communicate with reader content script(s).
 */
export default class ReaderContentScriptApi {
	private readonly _badge: BrowserActionBadgeApi;
	constructor(params: {
		badgeApi: BrowserActionBadgeApi;
		onGetDisplayPreference: () => Promise<DisplayPreference | null>;
		onChangeDisplayPreference: (
			preference: DisplayPreference
		) => Promise<DisplayPreference>;
		onRegisterPage: (
			tabId: number,
			data: ParseResult
		) => Promise<ArticleLookupResult>;
		onCommitReadState: (
			tabId: number,
			commitData: ReadStateCommitData,
			isCompletionCommit: boolean
		) => Promise<UserArticle>;
		onGetComments: (slug: string) => Promise<CommentThread[]>;
		onPostArticle: (form: PostForm) => Promise<Post>;
		onPostComment: (
			form: CommentForm
		) => Promise<{ article: UserArticle; comment: CommentThread }>;
		onPostCommentAddendum: (
			form: CommentAddendumForm
		) => Promise<CommentThread>;
		onPostCommentRevision: (
			form: CommentRevisionForm
		) => Promise<CommentThread>;
		onReadArticle: (tabId: number, slug: string) => Promise<void>;
		onReportArticleIssue: (request: ArticleIssueReportRequest) => Promise<void>;
		onRequestTwitterBrowserLinkRequestToken: () => Promise<TwitterRequestToken>;
		onSetStarred: (form: StarForm) => Promise<UserArticle>;
		onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>;
	}) {
		// set badge api
		this._badge = params.badgeApi;
		// listen for messages from content script
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			if (
				message.to === 'eventPage' &&
				message.from === 'readerContentScript'
			) {
				console.log(
					`[ReaderApi] received ${message.type} message from tab # ${sender.tab?.id}`
				);
				switch (message.type) {
					case 'getDisplayPreference':
						createMessageResponseHandler(
							params.onGetDisplayPreference(),
							sendResponse
						);
						return true;
					case 'changeDisplayPreference':
						createMessageResponseHandler(
							(async () => {
								await this.sendMessageToOtherTabs(sender.tab.id, {
									type: 'displayPreferenceChanged',
									data: message.data,
								});
								return await params.onChangeDisplayPreference(message.data);
							})(),
							sendResponse
						);
						return true;
					case 'loadingAnimationTick':
						(async () => {
							const tick = message.data as number;
							if (tick === 0) {
								await this._badge.setDefault(sender.tab.id);
							}
							await this._badge.setLoading(sender.tab.id, tick);
						})();
						break;
					case 'registerPage':
						createMessageResponseHandler(
							(async () => {
								await this.setTab({
									articleId: null,
									id: sender.tab.id,
								});
								try {
									const result = await params.onRegisterPage(sender.tab.id, message.data);
									await this.setTab({
										articleId: result.userArticle.id,
										id: sender.tab.id,
									});
									const tabs = await this.getTabs();
									for (const tab of tabs) {
										if (tab.articleId === result.userArticle.id) {
											await this._badge.setReading(tab.id, result.userArticle);
											await chrome.action.setTitle({
												tabId: tab.id,
												title: `${calculateEstimatedReadTime(
													result.userArticle.wordCount
												)} min. read`,
											});
										}
									}
									return result;
								} catch (ex) {
									await this.removeTab(sender.tab.id);
									await this._badge.setDefault(sender.tab.id);
									throw ex;
								}
							})(),
							sendResponse
						);
						return true;
					case 'commitReadState':
						createMessageResponseHandler(
							(async () => {
								const article = await params.onCommitReadState(
									sender.tab.id,
									message.data.commitData,
									message.data.isCompletionCommit
								);
								const tabs = await this.getTabs();
								for (const tab of tabs) {
									if (tab.articleId === article.id) {
										await this._badge.setReading(tab.id, article);
									}
								}
								return article;
							})(),
							sendResponse
						);
						return true;
					case 'unregisterPage':
						// sender.tab is undefined in Firefox
						// tab won't be removed until a messaging error occurs
						const tabId = sender?.tab?.id;
						if (tabId != null) {
							this.removeTab(tabId);
						}
						break;
					case 'closeWindow':
						chrome.windows.remove(message.data as number, () => {
							if (chrome.runtime.lastError) {
								console.log(
									`[ReaderApi] error closing window, message: ${chrome.runtime.lastError.message}`
								);
							}
						});
						break;
					case 'getComments':
						createMessageResponseHandler(
							params.onGetComments(message.data),
							sendResponse
						);
						return true;
					case 'hasWindowClosed':
						createMessageResponseHandler(
							new Promise<boolean>((resolve, reject) => {
								chrome.windows.get(message.data as number, (chromeWindow) => {
									if (chrome.runtime.lastError) {
										console.log(
											`[ReaderApi] error getting window, message: ${chrome.runtime.lastError.message}`
										);
									}
									resolve(!chromeWindow);
								});
							}),
							sendResponse
						);
						return true;
					case 'openWindow':
						const request = message.data as WindowOpenRequest;
						createMessageResponseHandler(
							new Promise<number>((resolve, reject) => {
								chrome.windows.create(
									{
										type: 'popup',
										url: request.url,
										width: request.width,
										height: request.height,
										focused: true,
									},
									(chromeWindow) => {
										if (chrome.runtime.lastError) {
											console.log(
												`[ReaderApi] error opening window, message: ${chrome.runtime.lastError.message}`
											);
											reject(chrome.runtime.lastError);
											return;
										}
										resolve(chromeWindow.id);
									}
								);
							}),
							sendResponse
						);
						return true;
					case 'postArticle':
						createMessageResponseHandler(
							params.onPostArticle(message.data),
							sendResponse
						);
						return true;
					case 'postComment':
						createMessageResponseHandler(
							params.onPostComment(message.data),
							sendResponse
						);
						return true;
					case 'postCommentAddendum':
						createMessageResponseHandler(
							params.onPostCommentAddendum(message.data),
							sendResponse
						);
						return true;
					case 'postCommentRevision':
						createMessageResponseHandler(
							params.onPostCommentRevision(message.data),
							sendResponse
						);
						return true;
					case 'readArticle':
						createMessageResponseHandler(
							params.onReadArticle(sender.tab.id, message.data),
							sendResponse
						);
						return true;
					case 'reportArticleIssue':
						createMessageResponseHandler(
							params.onReportArticleIssue(message.data),
							sendResponse
						);
						return true;
					case 'requestTwitterBrowserLinkRequestToken':
						createMessageResponseHandler(
							params.onRequestTwitterBrowserLinkRequestToken(),
							sendResponse
						);
						return true;
					case 'setStarred':
						createMessageResponseHandler(
							params.onSetStarred(message.data),
							sendResponse
						);
						return true;
					case 'deleteComment':
						createMessageResponseHandler(
							params.onDeleteComment(message.data),
							sendResponse
						);
						return true;
				}
			}
			return undefined;
		});
	}
	private async getTabs() {
		const result = await chrome.storage.local.get('readerTabs');
		return (result['readerTabs'] || []) as ReaderContentScriptTab[];
	}
	private async setTabs(tabs: ReaderContentScriptTab[]) {
		await chrome.storage.local.set({ 'readerTabs': tabs });
	}
	private async setTab(tab: ReaderContentScriptTab) {
		let tabs = await this.getTabs();
		tabs = tabs.filter(existingTab => existingTab.id !== tab.id);
		tabs.push(tab);
		await this.setTabs(tabs);
	}
	private async removeTab(id: number) {
		const tabs = await this.getTabs();
		if (tabs.some(tab => tab.id === id)) {
			await this.setTabs(tabs.filter(tab => tab.id !== id));
		}
	}
	private async broadcastMessage<T>(
		tabs: ReaderContentScriptTab[],
		message: Message
	) {
		for (const tab of tabs) {
			console.log(
				`[ReaderApi] sending ${message.type} message to tab # ${tab.id}`
			);
			try {
				await chrome.tabs.sendMessage(tab.id, message);
			} catch (ex) {
				console.log(
					`[ReaderApi] error sending message to tab # ${tab.id}, message: ${ex}`
				);
				await this.removeTab(tab.id);
			}
		}
	}
	private async sendMessageToAllTabs(message: Message) {
		await this.broadcastMessage(await this.getTabs(), message);
	}
	private async sendMessageToOtherTabs(fromTabId: number, message: Message) {
		const tabs = await this.getTabs();
		await this.broadcastMessage(
			tabs.filter((tab) => tab.id !== fromTabId),
			message
		);
	}
	private async sendMessageToArticleTabs(articleId: number, message: Message) {
		const tabs = await this.getTabs();
		await this.broadcastMessage(
			tabs.filter((tab) => tab.articleId === articleId),
			message
		);
	}
	public async articleUpdated(event: ArticleUpdatedEvent) {
		await this.sendMessageToArticleTabs(event.article.id, {
			type: 'articleUpdated',
			data: event,
		});
	}
	public async authServiceLinkCompleted(response: AuthServiceBrowserLinkResponse) {
		await this.sendMessageToAllTabs({
			type: 'authServiceLinkCompleted',
			data: response,
		});
	}
	public async clearTabs() {
		await this.setTabs([]);
	}
	public async commentPosted(comment: CommentThread) {
		await this.sendMessageToArticleTabs(comment.articleId, {
			type: 'commentPosted',
			data: comment,
		});
	}
	public async commentUpdated(comment: CommentThread) {
		await this.sendMessageToArticleTabs(comment.articleId, {
			type: 'commentUpdated',
			data: comment,
		});
	}
	public async displayPreferenceChanged(preference: DisplayPreference) {
		await this.sendMessageToAllTabs({
			type: 'displayPreferenceChanged',
			data: preference,
		});
	}

	public async userSignedOut() {
		await this.sendMessageToAllTabs({
			type: 'userSignedOut',
		});
		const tabs = await this.getTabs();
		for (const tab of tabs) {
			await this._badge.setDefault(tab.id);
		}
		await this.clearTabs();
	}
	public async userUpdated(user: UserAccount) {
		await this.sendMessageToAllTabs({
			type: 'userUpdated',
			data: user,
		});
	}
}
