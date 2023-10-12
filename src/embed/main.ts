// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { DateTime } from 'luxon';
import AsyncTracker from '../common/AsyncTracker';
import BrowserApi from '../common/BrowserApi';
import Captcha from '../common/captcha/Captcha';
import { ExitReason } from '../common/components/Flow';
import { Toast } from '../common/components/Toaster';
import parseDocumentContent from '../common/contentParsing/parseDocumentContent';
import EventManager from '../common/EventManager';
import { createUrl } from '../common/HttpEndpoint';
import IFrameMessagingContext from '../common/IFrameMessagingContext';
import AuthenticationError, {
	errorMessage as authenticationErrorMessage,
} from '../common/models/auth/AuthenticationError';
import { isAuthServiceBrowserLinkSuccessResponse } from '../common/models/auth/AuthServiceBrowserLinkResponse';
import AuthServiceProvider from '../common/models/auth/AuthServiceProvider';
import {
	InitializationAction,
	InitializationActivationResponse,
	InitializationResponse,
} from '../common/models/embed/InitializationResponse';
import { createCommentThread } from '../common/models/social/Post';
import UserAccount from '../common/models/UserAccount';
import { getClientPreferredColorScheme } from '../common/models/userAccounts/DisplayPreference';
import UserArticle from '../common/models/UserArticle';
import Page from '../common/reading/Page';
import Reader from '../common/reading/Reader';
import { findRouteByKey, parseUrlForRoute } from '../common/routing/Route';
import routes from '../common/routing/routes';
import ScreenKey from '../common/routing/ScreenKey';
import SemanticVersion from '../common/SemanticVersion';
import ClipboardService from '../common/services/ClipboardService';
import DialogService, { DialogState } from '../common/services/DialogService';
import ToasterService from '../common/services/ToasterService';
import insertFontStyleElement from '../common/shadowDom/insertFontStyleElement';
import ShareChannel from '../common/sharing/ShareChannel';
import ApiServer from './ApiServer';
import CommentsSectionComponentHost from './CommentsSectionComponentHost';
import GlobalComponentHost from './GlobalComponentHost';
import BrowserApiRelayMessenger from './BrowserApiRelayMessenger';
import { isHttpProblemDetails } from '../common/ProblemDetails';
import AuthServiceBrowserPopup from '../common/AuthServiceBrowserPopup';
import KeyValuePair from '../common/KeyValuePair';
import { ShareChannelData } from '../common/sharing/ShareData';
import { createQueryString } from '../common/routing/queryString';
import { openTweetComposerBrowserWindow } from '../common/sharing/twitter';
import * as React from 'react';
import OnboardingFlow from './components/OnboardingFlow';

interface State {
	article: UserArticle;
	dialogs: KeyValuePair<number, DialogState>[];
	error: string | null;
	toasts: Toast[];
	user: UserAccount | null;
}

const apiServer = new ApiServer({
	clientVersion: new SemanticVersion(
		window.reallyreadit.embed.config.version.embed
	),
	endpoint: window.reallyreadit.embed.config.apiServer,
});

function activate(initializationResponse: InitializationActivationResponse) {
	// set up the reader
	const page = new Page(
		parseDocumentContent({
			url: window.location,
		}).primaryTextContainers
	);
	page.setReadState(initializationResponse.userArticle.readState);
	const reader = new Reader((commitEvent) => {
		apiServer
			.updateReadProgress({
				articleId: initializationResponse.article.id,
				readState: commitEvent.readStateArray,
			})
			.then((res) => {
				setState({
					article: res.article,
				});
				browserApi.articleUpdated({
					article: res.article,
					isCompletionCommit: commitEvent.isCompletionCommit,
				});
			});
	});
	reader.loadPage(page);
	// document messaging interface
	window.addEventListener('message', (event) => {
		if (!/(\/\/|\.)readup\.org$/.test(event.origin)) {
			return;
		}
		switch ((event.data?.type as String) || null) {
			case 'toggleVisualDebugging':
				page.toggleVisualDebugging();
				break;
		}
	});
	// iframe communication to readup.org and extension
	const browserApiRelayMessenger = new BrowserApiRelayMessenger({
		onMessagePosted: (messageData) => {
			iframeMessaging.sendMessage({
				type: 'browser',
				data: messageData,
			});
		},
	});
	const browserApi = new BrowserApi(browserApiRelayMessenger)
		.addListener('articleUpdated', (event) => {
			setState({
				article: event.article,
			});
		})
		.addListener('authServiceLinkCompleted', (response) => {
			if (
				isAuthServiceBrowserLinkSuccessResponse(response) &&
				response.association.provider === AuthServiceProvider.Twitter &&
				!state.user.hasLinkedTwitterAccount
			) {
				setState({
					user: {
						...state.user,
						hasLinkedTwitterAccount: true,
					},
				});
			}
		})
		.addListener('commentPosted', (comment) => {
			if (comment.articleId === initializationResponse.article.id) {
				commentsSection.commentPosted(comment);
			}
		})
		.addListener('commentUpdated', (comment) => {
			if (comment.articleId === initializationResponse.article.id) {
				commentsSection.commentUpdated(comment);
			}
		})
		.addListener('userSignedIn', (data) => {
			let user: UserAccount;
			// check for broadcast from legacy web app instance
			if ('userAccount' in data) {
				user = data.userAccount;
			} else {
				user = data;
			}
			setState({
				user,
			});
		})
		.addListener('userSignedOut', () => {
			setState({
				error: 'You were signed out in another tab.',
			});
		})
		.addListener('userUpdated', (user) => {
			setState({
				user,
			});
		});
	const iframe = document.createElement('iframe');
	iframe.src = createUrl(
		window.reallyreadit.embed.config.webServer,
		'/embed-iframe-bridge/index.html'
	);
	iframe.style.display = 'none';
	document.body.appendChild(iframe);
	const iframeMessaging = new IFrameMessagingContext(
		iframe.contentWindow,
		window.reallyreadit.embed.config.webServer.protocol +
			'://' +
			window.reallyreadit.embed.config.webServer.host
	);
	iframeMessaging.addListener((message) => {
		switch (message.type) {
			case 'browser':
				browserApiRelayMessenger.relayMessage(message.data);
				break;
		}
	});
	// services
	const clipboardService = new ClipboardService((content, intent) => {
			toasterService.addToast(content, intent);
		}),
		createAbsoluteUrl = (path: string) => {
			return createUrl(window.reallyreadit.embed.config.webServer, path);
		},
		dialogService = new DialogService<State>({
			setState: (nextState, callback) => {
				setState(nextState(state)).then(callback);
			},
		}),
		eventManager = new EventManager<{
			onOnboardingCompleted: void;
		}>(),
		handleShareChannelRequest = (data: ShareChannelData) => {
			switch (data.channel) {
				case ShareChannel.Clipboard:
					clipboardService.copyText(data.text, 'Link copied to clipboard');
					break;
				case ShareChannel.Email:
					window.open(
						`mailto:${createQueryString({
							body: data.body,
							subject: data.subject,
						})}`,
						'_blank'
					);
					break;
				case ShareChannel.Twitter:
					openTweetComposerBrowserWindow(data);
					break;
			}
		},
		handleShareRequest = () => ({
			channels: [
				ShareChannel.Clipboard,
				ShareChannel.Email,
				ShareChannel.Twitter,
			],
		}),
		navTo = (url: string) => {
			const result = parseUrlForRoute(url);
			if (
				(result.isInternal && result.route) ||
				(!result.isInternal && result.url)
			) {
				openInNewTab(result.url.href);
				return true;
			}
			return false;
		},
		openInNewTab = (url: string) => {
			window.open(url, '_blank');
		},
		toasterService = new ToasterService({
			asyncTracker: new AsyncTracker(),
			setState: (nextState) => {
				setState(nextState(state));
			},
		}),
		viewProfile = (userName: string) => {
			openInNewTab(
				createAbsoluteUrl(
					findRouteByKey(routes, ScreenKey.Profile).createUrl({ userName })
				)
			);
		};
	// global ui state
	let state: State = {
		article: initializationResponse.article,
		dialogs: [],
		error: null,
		toasts: [],
		user: initializationResponse.user,
	};
	function setState(nextState: Partial<State>): Promise<any> {
		state = {
			...state,
			...nextState,
		};
		const stateUpdates: (() => Promise<any>)[] = [
			() => globalUi.setState(state),
		];
		if ('article' in nextState || 'user' in nextState) {
			stateUpdates.push(() =>
				commentsSection.setState({
					article: state.article,
					user: state.user,
				})
			);
		}
		return Promise.all(stateUpdates.map((update) => update()));
	}
	// fonts
	insertFontStyleElement(
		createUrl(window.reallyreadit.embed.config.staticServer, '/common/fonts/'),
		[
			{
				family: 'SF Pro Text',
				fileName: 'sf-pro-text.woff',
			},
		]
	);
	// global ui host
	const globalUi = new GlobalComponentHost({
		domAttachmentDelegate: (shadowHost) => {
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
		},
		services: {
			clipboardService,
			dialogService,
			toasterService,
		},
		state: {
			article: state.article,
			dialogs: state.dialogs,
			error: state.error,
			toasts: state.toasts,
		},
	});
	globalUi.attach();
	// comments section host
	const lastParagraphElement = page.elements[page.elements.length - 1].element;
	if ('IntersectionObserver' in window) {
		const lastParagraphElementObserver = new IntersectionObserver(
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
		lastParagraphElementObserver.observe(lastParagraphElement);
	} else {
		loadComments();
	}
	function loadComments() {
		commentsSection.attach();
		apiServer
			.getComments(initializationResponse.article.slug)
			.then((comments) => {
				commentsSection.setState({
					comments: {
						isLoading: false,
						value: comments,
					},
				});
			});
	}
	const commentsSection = new CommentsSectionComponentHost({
		domAttachmentDelegate: (shadowHost) => {
			const wrapper = document.createElement('div');
			wrapper.style.margin = '2em 0 0 0';
			wrapper.append(shadowHost);
			lastParagraphElement.insertAdjacentElement('afterend', wrapper);
		},
		services: {
			dialogService,
			onAuthenticationRequired: (analyticsAction, delegate) => {
				dialogService.openDialog(
					sharedState => React.createElement(
						OnboardingFlow,
						{
							analyticsAction,
							captcha: new Captcha(null, (handler) => {
								// no captcha
							}),
							onClose: (reason) => {
								dialogService.closeDialog();
								if (reason !== ExitReason.Aborted) {
									eventManager.triggerEvent('onOnboardingCompleted', null);
								}
								eventManager.removeListeners('onOnboardingCompleted');
							},
							onCreateAccount: (req) => {
								return apiServer
									.createUserAccount({
										name: req.name,
										email: req.email,
										password: req.password,
										captchaResponse: req.captchaResponse,
										timeZoneName: DateTime.local().zoneName,
										theme: getClientPreferredColorScheme(),
										analytics: {
											action: req.analyticsAction,
											currentPath: window.location.pathname,
											initialPath: window.location.pathname,
											referrerUrl: window.document.referrer,
										},
										pushDevice: null,
									})
									.then((profile) => {
										browserApi.userSignedIn(profile);
										return setState({
											user: profile.userAccount,
										});
									});
							},
							onCreateAuthServiceAccount: (req) => {
								return apiServer
									.createAuthServiceAccount({
										name: req.name,
										pushDevice: null,
										theme: getClientPreferredColorScheme(),
										timeZoneName: DateTime.local().zoneName,
										analytics: {
											action: req.analyticsAction,
											currentPath: window.location.pathname,
											initialPath: window.location.pathname,
											referrerUrl: window.document.referrer,
										},
										token: req.token,
									})
									.then((profile) => {
										browserApi.userSignedIn(profile);
										return setState({
											user: profile.userAccount,
										});
									});
							},
							onRequestPasswordReset: (req) => {
								return apiServer.requestPasswordReset(req);
							},
							onShowToast: (content, intent) => {
								toasterService.addToast(content, intent);
							},
							onSignIn: (req) => {
								return apiServer
									.signIn({
										authServiceToken: req.authServiceToken,
										email: req.email,
										password: req.password,
										pushDevice: null,
									})
									.then((profile) => {
										browserApi.userSignedIn(profile);
										return setState({
											user: profile.userAccount,
										});
									});
							},
							onSignInWithAuthService: (provider) => {
								const popup = new AuthServiceBrowserPopup();
								// open window synchronously to avoid being blocked by popup blockers
								popup.open();
								return apiServer
									.requestAuthServiceBrowserPopupRequest({
										provider,
									})
									.then((response) =>
										popup.load(response.popupUrl).then(() =>
											apiServer
												.getAuthServiceBrowserPopupResponse({
													requestId: response.requestId,
												})
												.then((popupResponse) => {
													if (popupResponse.userProfile) {
														browserApi.userSignedIn(popupResponse.userProfile);
														return setState({
															user: popupResponse.userProfile.userAccount,
														}).then(() => popupResponse);
													} else {
														return popupResponse;
													}
												})
												.catch((reason) => {
													if (isHttpProblemDetails(reason) && reason.status === 404) {
														return {
															association: null,
															authServiceToken: null,
															error: AuthenticationError.Cancelled,
															userProfile: null,
														};
													}
													throw reason;
												})
										)
									);
							},
							user: sharedState.user
						}
					)
				);
				return eventManager.addListener('onOnboardingCompleted', delegate);
			},
			onCreateAbsoluteUrl: createAbsoluteUrl,
			onDeleteComment: (form) =>
				apiServer.deleteComment(form).then((comment) => {
					browserApi.commentUpdated(comment);
					return comment;
				}),
			onLinkAuthServiceAccount: (provider) => {
				const popup = new AuthServiceBrowserPopup();
				// open window synchronously to avoid being blocked by popup blockers
				popup.open();
				return apiServer
					.requestAuthServiceBrowserPopupRequest({
						provider,
					})
					.then((response) =>
						popup.load(response.popupUrl).then(() =>
							apiServer
								.getAuthServiceBrowserPopupResponse({
									requestId: response.requestId,
								})
								.then((popupResponse) => {
									// simulate legacy account linking api
									if (popupResponse.association) {
										browserApi.authServiceLinkCompleted({
											association: popupResponse.association,
											error: popupResponse.error,
											requestToken: '',
										});
										return popupResponse.association;
									} else {
										throw new Error(
											popupResponse.error != null
												? popupResponse.error === AuthenticationError.Cancelled
													? 'Cancelled'
													: authenticationErrorMessage[popupResponse.error]
												: 'BrowserPopupResponseResponse.association is null.'
										);
									}
								})
								.catch((reason) => {
									if (isHttpProblemDetails(reason) && reason.status === 404) {
										throw new Error('Cancelled');
									}
									throw reason;
								})
						)
					);
			},
			onNavTo: navTo,
			onPostArticle: (form) =>
				apiServer.postArticle(form).then((post) => {
					setState({
						article: post.article,
					});
					browserApi.articlePosted(post);
					browserApi.articleUpdated({
						article: post.article,
						isCompletionCommit: false,
					});
					if (post.comment) {
						browserApi.commentPosted(createCommentThread(post));
					}
					return post;
				}),
			onPostComment: (form) =>
				apiServer.postComment(form).then((res) => {
					setState({
						article: res.article,
					});
					browserApi.articleUpdated({
						article: res.article,
						isCompletionCommit: false,
					});
					browserApi.commentPosted(res.comment);
					return res;
				}),
			onPostCommentAddendum: (form) =>
				apiServer.postCommentAddendum(form).then((comment) => {
					browserApi.commentUpdated(comment);
					return comment;
				}),
			onPostCommentRevision: (form) =>
				apiServer.postCommentRevision(form).then((comment) => {
					browserApi.commentUpdated(comment);
					return comment;
				}),
			onShare: handleShareRequest,
			onShareViaChannel: handleShareChannelRequest,
			onViewProfile: viewProfile,
			toasterService,
		},
		state: {
			article: state.article,
			comments: {
				isLoading: true,
			},
			user: state.user,
		},
	});
}

Promise.all<void, InitializationResponse>([
	new Promise((resolve) => {
		window.addEventListener('DOMContentLoaded', () => {
			resolve();
		});
	}),
	apiServer.initialize({
		url: window.location.href,
	}),
]).then((values) => {
	// check for activation
	const initializationResponse = values[1];
	if (initializationResponse.action === InitializationAction.Activate) {
		activate(initializationResponse);
	}
});
