import { DateTime } from 'luxon';
import AsyncTracker from '../common/AsyncTracker';
import BrowserApi from '../common/BrowserApi';
import Captcha from '../common/captcha/Captcha';
import { ExitReason } from '../common/components/BrowserOnboardingFlow';
import { Intent, Toast } from '../common/components/Toaster';
import parseDocumentContent from '../common/contentParsing/parseDocumentContent';
import EventManager from '../common/EventManager';
import { createUrl } from '../common/HttpEndpoint';
import IFrameMessagingContext from '../common/IFrameMessagingContext';
import AuthenticationError from '../common/models/auth/AuthenticationError';
import AuthServiceAccountAssociation from '../common/models/auth/AuthServiceAccountAssociation';
import { AuthServiceBrowserLinkResponse, isAuthServiceBrowserLinkSuccessResponse } from '../common/models/auth/AuthServiceBrowserLinkResponse';
import AuthServiceProvider from '../common/models/auth/AuthServiceProvider';
import { InitializationAction, InitializationActivationResponse, InitializationResponse } from '../common/models/embed/InitializationResponse';
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
import DialogService, { Dialog } from '../common/services/DialogService';
import ToasterService from '../common/services/ToasterService';
import insertFontStyleElement from '../common/shadowDom/insertFontStyleElement';
import ShareChannel from '../common/sharing/ShareChannel';
import ApiServer from './ApiServer';
import CommentsSectionComponentHost from './CommentsSectionComponentHost';
import GlobalComponentHost from './GlobalComponentHost';
import BrowserApiRelayMessenger from './BrowserApiRelayMessenger';

interface State {
	article: UserArticle,
	dialogs: Dialog[],
	error: string | null,
	isOnboarding: boolean,
	toasts: Toast[],
	user: UserAccount | null
}

const apiServer = new ApiServer({
	clientVersion: new SemanticVersion(window.reallyreadit.embed.config.version.embed),
	endpoint: window.reallyreadit.embed.config.apiServer
});

function activate(initializationResponse: InitializationActivationResponse) {
	// set up the reader
	const page = new Page(
		parseDocumentContent()
			.primaryTextContainers
	);
	page.setReadState(initializationResponse.userArticle.readState);
	const reader = new Reader(
		commitEvent => {
			apiServer
				.updateReadProgress({
					articleId: initializationResponse.article.id,
					readState: commitEvent.readStateArray
				})
				.then(
					res => {
						setState({
							article: res.article
						});
						browserApi.articleUpdated({
							article: res.article,
							isCompletionCommit: commitEvent.isCompletionCommit
						});
					}
				);
		}
	);
	reader.loadPage(page);
	// document messaging interface
	window.addEventListener(
		'message',
		event => {
			if (!/(\/\/|\.)readup\.com$/.test(event.origin)) {
				return;
			}
			switch (event.data?.type as String || null) {
				case 'toggleVisualDebugging':
					page.toggleVisualDebugging();
					break;
			}
		}
	);
	// iframe communication to readup.com and extension
	const browserApiRelayMessenger = new BrowserApiRelayMessenger({
		onMessagePosted: messageData => {
			iframeMessaging.sendMessage({
				type: 'browser',
				data: messageData
			});
		}
	});
	const browserApi = new BrowserApi(browserApiRelayMessenger)
		.addListener(
			'articleUpdated',
			event => {
				setState({
					article: event.article
				});
			}
		)
		.addListener(
			'authServiceLinkCompleted',
			response => {
				if (
					isAuthServiceBrowserLinkSuccessResponse(response) &&
					response.association.provider === AuthServiceProvider.Twitter &&
					!state.user.hasLinkedTwitterAccount
				) {
					setState({
						user: {
							...state.user,
							hasLinkedTwitterAccount: true
						}
					});
				}
			}
		)
		.addListener(
			'commentPosted',
			comment => {
				if (comment.articleId === initializationResponse.article.id) {
					commentsSection.commentPosted(comment);
				}
			}
		)
		.addListener(
			'commentUpdated',
			comment => {
				if (comment.articleId === initializationResponse.article.id) {
					commentsSection.commentUpdated(comment);
				}
			}
		)
		.addListener(
			'userSignedIn',
			data => {
				let user: UserAccount;
				// check for broadcast from legacy web app instance
				if ('userAccount' in data) {
					user = data.userAccount;
				} else {
					user = data;
				}
				setState({
					user
				});
			}
		)
		.addListener(
			'userSignedOut',
			() => {
				setState({
					error: 'You were signed out in another tab.'
				});
			}
		)
		.addListener(
			'userUpdated',
			user => {
				setState({
					user
				});
			}
		);
	const iframe = document.createElement('iframe');
	iframe.src = createUrl(window.reallyreadit.embed.config.webServer, '/embed-iframe-bridge/index.html');
	iframe.style.display = 'none';
	document.body.appendChild(iframe);
	const iframeMessaging = new IFrameMessagingContext(
		iframe.contentWindow,
		window.reallyreadit.embed.config.webServer.protocol +
		'://' +
		window.reallyreadit.embed.config.webServer.host
	);
	iframeMessaging.addListener(
		message => {
			switch (message.type) {
				case 'browser':
					browserApiRelayMessenger.relayMessage(message.data);
					break;
			}
		}
	);
	// services
	const
		clipboardService = new ClipboardService(
			(content, intent) => {
				toasterService.addToast(content, intent);
			}
		),
		createAbsoluteUrl = (path: string) => {
			return createUrl(window.reallyreadit.embed.config.webServer, path)
		},
		dialogService = new DialogService({
			setState: nextState => {
				setState(
					nextState(state)
				);
			}
		}),
		eventManager = new EventManager<{
			'onOnboardingCompleted': void
		}>(),
		handleShareRequest = () => ({
			channels: [
				ShareChannel.Clipboard,
				ShareChannel.Email,
				ShareChannel.Twitter
			]
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
			setState: nextState => {
				setState(
					nextState(state)
				);
			}
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
		isOnboarding: false,
		toasts: [],
		user: initializationResponse.user
	};
	function setState(nextState: Partial<State>) {
		state = {
			...state,
			...nextState
		};
		if ('article' in nextState) {
			globalUi.articleUpdated(nextState.article);
			commentsSection.articleUpdated(nextState.article);
		}
		if ('dialogs' in nextState) {
			globalUi.dialogsUpdated(nextState.dialogs);
		}
		if ('error' in nextState) {
			globalUi.errorUpdated(nextState.error);
		}
		if ('isOnboarding' in nextState) {
			globalUi.isOnboardingUpdated(nextState.isOnboarding);
		}
		if ('toasts' in nextState) {
			globalUi.toastsUpdated(nextState.toasts);
		}
		if ('user' in nextState) {
			globalUi.userUpdated(nextState.user);
			commentsSection.userUpdated(nextState.user);
		}
	}
	// fonts
	insertFontStyleElement(
		createUrl(window.reallyreadit.embed.config.staticServer, '/common/fonts/'),
		[
			{
				family: 'SF Pro Text',
				fileName: 'sf-pro-text.woff'
			}
		]
	);
	// global ui host
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
		},
		services: {
			captcha: new Captcha(
				null,
				handler => {
					// no captcha
				}
			),
			clipboardService,
			dialogService,
			imageBasePath: createUrl(window.reallyreadit.embed.config.staticServer, '/common/images/'),
			onCloseOnboarding: reason => {
				setState({
					isOnboarding: false
				});
				if (reason !== ExitReason.Aborted) {
					eventManager.triggerEvent('onOnboardingCompleted', null);
				}
				eventManager.removeListeners('onOnboardingCompleted');
			},
			onCreateAccount: req => {
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
							marketingVariant: 0,
							referrerUrl: window.document.referrer
						},
						pushDevice: null
					})
					.then(
						profile => {
							setState({
								user: profile.userAccount
							});
							browserApi.userSignedIn(profile);
						}
					);
			},
			onCreateAuthServiceAccount: req => {
				return apiServer
					.createAuthServiceAccount({
						name: req.name,
						pushDevice: null,
						theme: getClientPreferredColorScheme(),
						timeZoneName: DateTime.local().zoneName,
						token: req.token
					})
					.then(
						profile => {
							setState({
								user: profile.userAccount
							});
							browserApi.userSignedIn(profile);
						}
					);
			},
			onRequestPasswordReset: req => {
				return apiServer.requestPasswordReset(req);
			},
			onSignIn: req => {
				return apiServer
					.signIn({
						authServiceToken: req.authServiceToken,
						email: req.email,
						password: req.password,
						pushDevice: null
					})
					.then(
						profile => {
							setState({
								user: profile.userAccount
							});
							browserApi.userSignedIn(profile);
						}
					);
			},
			onSignInWithApple: req => {
				return Promise.reject();
			},
			onSignInWithTwitter: req => {
				return Promise.reject();
			},
			toasterService
		}
	});
	globalUi
		.initialize(state)
		.attach();
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
		commentsSection
			.initialize({
				article: state.article,
				user: state.user
			})
			.attach();
		apiServer
			.getComments(initializationResponse.article.slug)
			.then(
				comments => {
					commentsSection.commentsLoaded(comments);
				}
			);
	}
	const commentsSection = new CommentsSectionComponentHost({
		domAttachmentDelegate: shadowHost => {
			const wrapper = document.createElement('div');
			wrapper.style.margin = '2em 0 0 0';
			wrapper.append(shadowHost);
			lastParagraphElement.insertAdjacentElement(
				'afterend',
				wrapper
			)
		},
		services: {
			clipboardService,
			dialogService,
			onAuthenticationRequired: delegate => {
				setState({
					isOnboarding: true
				});
				return eventManager.addListener('onOnboardingCompleted', delegate);
			},
			onCreateAbsoluteUrl: createAbsoluteUrl,
			onDeleteComment: form => apiServer
				.deleteComment(form)
				.then(
					comment => {
						browserApi.commentUpdated(comment);
						return comment;
					}
				),
			onLinkAuthServiceAccount: provider => {
				// open window synchronously to avoid being blocked by popup blockers
				const popup = window.open(
					'',
					'_blank',
					'height=300,location=0,menubar=0,toolbar=0,width=400'
				);
				return new Promise<AuthServiceAccountAssociation>(
					(resolve, reject) => {
						apiServer
							.requestTwitterBrowserLinkRequestToken()
							.catch(
								error => {
									popup.close();
									toasterService.addToast('Error Requesting Token', Intent.Danger);
									reject(error);
								}
							)
							.then(
								token => {
									if (!token) {
										return;
									}
									popup.location.href = createUrl(
										window.reallyreadit.embed.config.twitterApiServer,
										'/oauth/authorize',
										{
											'oauth_token': token.value
										}
									);
									const completionHandler = (response: AuthServiceBrowserLinkResponse) => {
										if (response.requestToken === token.value) {
											cleanupEventHandlers();
											popup.close();
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
									browserApi.addListener('authServiceLinkCompleted', completionHandler);
									const popupClosePollingInterval = window.setInterval(
										() => {
											if (popup.closed) {
												cleanupEventHandlers();
												reject(new Error('Cancelled'));
											}
										},
										1000
									);
									const cleanupEventHandlers = () => {
										browserApi.removeListener('authServiceLinkCompleted', completionHandler);
										window.clearInterval(popupClosePollingInterval);
									};
								}
							)
							.catch(reject);
					}
				);
			},
			onNavTo: navTo,
			onPostArticle: form => apiServer
				.postArticle(form)
				.then(
					post => {
						setState({
							article: post.article
						});
						browserApi.articlePosted(post);
						browserApi.articleUpdated({
							article: post.article,
							isCompletionCommit: false
						});
						if (post.comment) {
							browserApi.commentPosted(
								createCommentThread(post)
							);
						}
						return post;
					}
				),
			onPostComment: form => apiServer
				.postComment(form)
				.then(
					res => {
						setState({
							article: res.article
						});
						browserApi.articleUpdated({
							article: res.article,
							isCompletionCommit: false
						});
						browserApi.commentPosted(res.comment);
						return res;
					}
				),
			onPostCommentAddendum: form => apiServer
				.postCommentAddendum(form)
				.then(
					comment => {
						browserApi.commentUpdated(comment);
						return comment;
					}
				),
			onPostCommentRevision: form => apiServer
				.postCommentRevision(form)
				.then(
					comment => {
						browserApi.commentUpdated(comment);
						return comment;
					}
				),
			onShare: handleShareRequest,
			onViewProfile: viewProfile,
			toasterService
		}
	});
}

Promise
	.all<void, InitializationResponse>([
		new Promise(
			resolve => {
				window.addEventListener(
					'DOMContentLoaded',
					() => {
						resolve();
					}
				);
			}
		),
		apiServer.initialize({
			url: window.location.href
		})
	])
	.then(
		values => {
			// check for activation
			const initializationResponse = values[1];
			if (initializationResponse.action === InitializationAction.Activate) {
				activate(initializationResponse);
			}
		}
	);