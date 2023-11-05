// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import ServerApi from './ServerApi';
import renderHtml from '../common/templates/html';
import UserAccountRole from '../../common/models/UserAccountRole';
import { Config } from './Config';
import routes from '../../common/routing/routes';
import * as bunyan from 'bunyan';
import * as cookieParser from 'cookie-parser';
import * as url from 'url';
import PasswordResetRequest from '../../common/models/PasswordResetRequest';
import CommentThread from '../../common/models/CommentThread';
import AppRoot from '../common/components/AppRoot';
import CaptchaPlaceholder from './CaptchaPlaceholder';
import BrowserRoot from '../common/components/BrowserRoot';
import ClientType from '../common/ClientType';
import {
	createQueryString,
	clientTypeQueryStringKey,
	marketingScreenVariantQueryStringKey,
	unroutableQueryStringKeys,
	appReferralQueryStringKey,
	marketingVariantQueryStringKey,
	appPlatformQueryStringKey,
	authenticateQueryStringKey,
} from '../../common/routing/queryString';
import {
	extensionVersionCookieKey,
	sessionIdCookieKey,
	hideTrackingAnimationPromptCookieKey,
} from '../../common/cookies';
import {
	findRouteByLocation,
	findRouteByKey,
} from '../../common/routing/Route';
import BrowserApiPlaceholder from './BrowserApiPlaceholder';
import AppApi from './AppApi';
import ExtensionApi from './ExtensionApi';
import ScreenKey from '../../common/routing/ScreenKey';
import * as fs from 'fs';
import * as path from 'path';
import VerificationTokenData from '../../common/models/VerificationTokenData';
import SemanticVersion from '../../common/SemanticVersion';
import * as crypto from 'crypto';
import AppReferral from '../common/AppReferral';
import { getDeviceType } from '../../common/DeviceType';
import TwitterCardMetadata from '../../common/models/articles/TwitterCardMetadata';
import TwitterCardMetadataRequest from '../../common/models/articles/TwitterCardMetadataRequest';
import { TwitterCard, TwitterCardType } from './TwitterCard';
import WebAppUserProfile from '../../common/models/userAccounts/WebAppUserProfile';
import PackageVersionInfo from '../../common/PackageVersionInfo';
import LinkType from '../../common/models/articles/LinkType';
import InitData from '../common/InitData';
import Exchange from '../common/serverApi/Exchange';
import { AppPlatform } from '../../common/AppPlatform';

// read configuration
let configFileName: string, envPort: string;
switch (process.env.NODE_ENV) {
	case 'development':
		configFileName = 'config.dev.json';
		break;
	case 'production':
		configFileName = 'config.prod.json';
		envPort = process.env.PORT;
		break;
	default:
		throw new Error('Unexpected value for process.env.NODE_ENV');
}
const config = JSON.parse(
	fs.readFileSync(path.join(__dirname, configFileName), {
		encoding: 'utf8',
	})
) as Config;
if (envPort != null) {
	config.port = envPort;
}

// route helper function
function findRouteByRequest(req: express.Request) {
	return findRouteByLocation(
		routes,
		{
			path: req.path,
			queryString: createQueryString(
				req.query as { [key: string]: string | string[] }
			),
		},
		unroutableQueryStringKeys
	);
}

// redirect helper functions
const nodeUrl = url;
function redirect(
	req: express.Request<
		{},
		any,
		any,
		{ [clientTypeQueryStringKey]?: string; [key: string]: any }
	>,
	res: express.Response,
	url: string,
	status: 301 | 302 = 302
) {
	if (clientTypeQueryStringKey in req.query) {
		const redirectUrl = nodeUrl.parse(url, true);
		url = nodeUrl.format({
			pathname: redirectUrl.pathname,
			query: {
				...redirectUrl.query,
				[clientTypeQueryStringKey]: req.query[clientTypeQueryStringKey],
			},
		});
	}
	res.redirect(status, url);
}
// TODO: support adding an (error) message!
function redirectToHomeScreen(req: express.Request, res: express.Response) {
	redirect(req, res, findRouteByKey(routes, ScreenKey.Home).createUrl());
}

// token helper function
// Swift URLComponents doesn't encode the plus sign like encodeURIComponent and WebUtility.UrlEncode do
function replaceSpacesWithPlusSign(token: string) {
	return token.replace(/\s/g, '+');
}

// read package.json version info
const version = JSON.parse(
	fs.readFileSync(config.packageFilePath, { encoding: 'utf8' })
)['it.reallyread'].version as PackageVersionInfo;

// set up logger
const log = bunyan.createLogger({
	name: 'app',
	serializers: {
		err: bunyan.stdSerializers.err,
		req: (req: Request) => ({
			method: req.method,
			url: req.url,
		}),
	},
});
if (config.logStream) {
	log.addStream(config.logStream);
}
// create server
let server = express();
// disable server header
server.disable('x-powered-by');
// configure request logging
server.use((req, res, next) => {
	log.info({ req });
	next();
});
// configure cookie parser
server.use(cookieParser());
// configure static content
if (config.serveStaticContent) {
	// attempt to serve static files first
	server.use(express.static(config.contentRootPath));
}
// apple app site association
server.get('/apple-app-site-association', (req, res) => {
	res.json({
		applinks: {
			apps: [],
			details: [
				{
					appID: 'PRH8B2NRNT.it.reallyread.mobile',
					paths: ['*'],
				},
			],
		},
	});
});
// version check
server.get('/version', (req, res) => {
	res.status(200).send(version.appPublic);
});
// authenticate
server.use((req, res, next) => {
	const clientType =
		(req.query[clientTypeQueryStringKey] as ClientType) || ClientType.Browser;
	const api = new ServerApi(
		config.apiServer,
		clientType,
		version.app.toString(),
		getDeviceType(req.headers['user-agent']),
		{
			key: config.cookieName,
			value: req.cookies[config.cookieName],
		}
	);
	req.api = api;
	req.clientType = clientType;
	if (api.hasAuthCookie() && api.shouldIncludeCredentials) {
		api
			.fetchJson<WebAppUserProfile>('GET', {
				path: '/UserAccounts/WebAppUserProfile',
			})
			.then((profile) => {
				req.userProfile = profile;
				// this header is added to allow the hosting web server to log the id of an authenticated user
				res.setHeader('X-Readup-User-Id', profile.userAccount.id);
				// the authenticate query string key should be deleted if present if the user is already signed in
				delete req.query[authenticateQueryStringKey];
				next();
			})
			.catch((reason: string[] | Error) => {
				if (
					(reason instanceof Array && reason.includes('Unauthenticated')) ||
					(reason instanceof Error && reason.message === 'InvalidSessionKey')
				) {
					res.clearCookie(config.cookieName, { domain: config.cookieDomain });
				}
				next();
			});
	} else {
		next();
	}
});
// authorize
server.use((req, res, next) => {
	const route = findRouteByRequest(req);
	if (
		!route ||
		route.authLevel == null ||
		(req.userProfile &&
			(req.userProfile.userAccount.role === route.authLevel ||
				req.userProfile.userAccount.role === UserAccountRole.Admin))
	) {
		next();
	} else {
		redirectToHomeScreen(req, res);
	}
});
// url migration
server.get('/articles/:sourceSlug/:articleSlug/:commentId?', (req, res) => {
	let params: { [key: string]: string } = {
		sourceSlug: req.params['sourceSlug'],
		articleSlug: req.params['articleSlug'],
	};
	if (req.params['commentId']) {
		params['commentId'] = req.params['commentId'];
	}
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.Comments).createUrl(params)
	);
});
server.get('/proof/:token', (req, res) => {
	req.api
		.fetchJson<VerificationTokenData>('GET', {
			path: '/Articles/VerifyProofToken',
			data: { token: req.params['token'] },
		})
		.then((data) => {
			const slugParts = data.article.slug.split('_');
			redirect(
				req,
				res,
				findRouteByKey(routes, ScreenKey.Comments).createUrl({
					sourceSlug: slugParts[0],
					articleSlug: slugParts[1],
				})
			);
		});
});
server.get('/leaderboards', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.Leaderboards).createUrl({
			view: 'writers',
		})
	);
});
server.get('/reads', (req, res) => {
	redirect(req, res, findRouteByKey(routes, ScreenKey.MyReads).createUrl());
});
server.get('/inbox', (req, res) => {
	redirect(req, res, findRouteByKey(routes, ScreenKey.MyFeed).createUrl());
});
server.get('/following', (req, res) => {
	redirect(req, res, findRouteByKey(routes, ScreenKey.MyFeed).createUrl());
});
// this route was never used AFAIK, it's there preventively for those users still on the browser
server.get('/replies', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.Notifications).createUrl()
	);
});
server.get('/privacy-policy', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()
	);
});
server.get('/terms', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()
	);
});
server.get('/earnings', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.Leaderboards).createUrl()
	);
});
server.get('/mission', (req, res) => {
	redirect(req, res, findRouteByKey(routes, ScreenKey.About).createUrl());
});
server.get('/team', (req, res) => {
	redirect(req, res, findRouteByKey(routes, ScreenKey.About).createUrl());
});
// handle redirects
server.get<{}, any, any, { token: string }>('/confirmEmail', (req, res) => {
	req.api
		.fetchJson('POST', {
			path: '/UserAccounts/ConfirmEmail2',
			data: { token: replaceSpacesWithPlusSign(req.query['token']) },
		})
		.then(() => {
			redirect(req, res, '/email/confirm/success');
		})
		.catch((error: string) => {
			const redirectUrl = (
				{
					AlreadyConfirmed: '/email/confirm/already-confirmed',
					Expired: '/email/confirm/expired',
					NotFound: '/email/confirm/not-found',
				} as { [key: string]: string }
			)[error];
			if (redirectUrl) {
				redirect(req, res, redirectUrl);
			} else {
				redirectToHomeScreen(req, res);
			}
		});
});
server.get<{}, any, any, { token: string }>('/resetPassword', (req, res) => {
	const token = replaceSpacesWithPlusSign(req.query['token']);
	req.api
		.fetchJson<PasswordResetRequest>('GET', {
			path: '/UserAccounts/PasswordResetRequest2',
			data: { token },
		})
		.then((resetRequest) => {
			redirect(
				req,
				res,
				url.format({
					pathname: '/',
					query: {
						'reset-password': '',
						email: resetRequest.emailAddress,
						token: token,
					},
				})
			);
		})
		.catch((error: string) => {
			const redirectUrl = (
				{
					Expired: '/password/reset/expired',
					NotFound: '/password/reset/not-found',
				} as { [key: string]: string }
			)[error];
			if (redirectUrl) {
				redirect(req, res, redirectUrl);
			} else {
				redirectToHomeScreen(req, res);
			}
		});
});
server.get<{ id?: string }, any, any, { token?: string }>(
	'/viewReply/:id?',
	(req, res) => {
		let path = '/UserAccounts/ViewReply2';
		const params = {} as { [key: string]: string };
		if (req.params['id']) {
			params['id'] = req.params['id'];
		} else if (req.query['token']) {
			params['token'] = replaceSpacesWithPlusSign(req.query['token']);
		}
		req.api
			.fetchJson<CommentThread>('POST', { path, data: params })
			.then((comment) => {
				const slugParts = comment.articleSlug.split('_');
				redirect(
					req,
					res,
					findRouteByKey(routes, ScreenKey.Comments).createUrl({
						sourceSlug: slugParts[0],
						articleSlug: slugParts[1],
						commentId: comment.id,
					})
				);
			})
			.catch(() => {
				redirectToHomeScreen(req, res);
			});
	}
);
server.get<{}, any, any, { installationId?: string }>(
	'/extension/uninstall',
	(req, res, next) => {
		if ('installationId' in req.query) {
			// log the removal
			req.api.logExtensionRemoval(req.query['installationId']).catch(() => {});
			// clear the cookie
			res.clearCookie(extensionVersionCookieKey, {
				domain: config.cookieDomain,
				secure: config.secureCookie,
			});
			delete req.cookies[extensionVersionCookieKey];
		}
		next();
	}
);
server.get('/mailLink/:id', (req, res) => {
	req.api
		.fetchJson('POST', { path: '/Email/Link/' + req.params['id'] })
		.then((result: { url: string }) => {
			redirect(req, res, result.url);
		})
		.catch(() => {
			redirectToHomeScreen(req, res);
		});
});
server.get('/writers/:slug', (req, res, next) => {
	// Create a query delegate that uses the API server request cache.
	const getAuthorProfile = () =>
		req.api.getAuthorProfile(
			{
				slug: req.params['slug'],
			},
			() => {
				// Callbacks aren't used in the server environment.
			}
		);
	// Capture the request.
	getAuthorProfile();
	// Process the request.
	req.api.processRequests().then(() => {
		// Check the result.
		const response = getAuthorProfile();
		if (response.value?.userName) {
			redirect(
				req,
				res,
				findRouteByKey(routes, ScreenKey.Profile).createUrl({
					userName: response.value?.userName,
				}),
				301
			);
		} else {
			next();
		}
	});
});
// render matched route or return 404
server.use((req, res, next) => {
	const route = findRouteByRequest(req);
	if (route) {
		req.matchedRoute = route;
		next();
	} else {
		redirectToHomeScreen(req, res);
	}
});
// render the app
server.get<
	{},
	any,
	any,
	{
		[appPlatformQueryStringKey]?: string;
		[appReferralQueryStringKey]?: string;
	}
>('/*', (req, res) => {
	// session id
	if (!req.cookies[sessionIdCookieKey]) {
		res.cookie('sessionId', crypto.randomBytes(8).toString('hex'), {
			httpOnly: true,
			domain: config.cookieDomain,
			secure: config.secureCookie,
			sameSite: 'none',
		});
	}
	// app referral
	let appReferral: AppReferral;
	if (req.query[appReferralQueryStringKey]) {
		try {
			appReferral = JSON.parse(req.query[appReferralQueryStringKey]);
		} catch {
			appReferral = {};
		}
	} else {
		appReferral = {};
	}
	// legacy
	if (req.cookies[marketingScreenVariantQueryStringKey]) {
		res.clearCookie(marketingScreenVariantQueryStringKey, {
			httpOnly: true,
			domain: config.cookieDomain,
			secure: config.secureCookie,
		});
	}
	if (req.cookies[marketingVariantQueryStringKey]) {
		res.clearCookie(marketingVariantQueryStringKey, {
			httpOnly: true,
			domain: config.cookieDomain,
			secure: config.secureCookie,
		});
	}
	// prepare props
	const deviceType = getDeviceType(req.headers['user-agent']);
	const extensionVersionString = req.cookies[extensionVersionCookieKey];
	const browserApi = new BrowserApiPlaceholder();
	const rootProps = {
		captcha: new CaptchaPlaceholder(),
		initialLocation: {
			path: req.path,
			queryString: createQueryString(req.query),
		},
		initialShowTrackingAnimationPrompt: req.userProfile ?
			!req.userProfile.userAccount.dateOrientationCompleted :
			!req.cookies[hideTrackingAnimationPromptCookieKey],
		initialUserProfile: req.userProfile,
		serverApi: req.api,
		staticServerEndpoint: config.staticServer,
		version: new SemanticVersion(version.app),
		webServerEndpoint: config.webServer,
	};
	// create root element and init data
	let rootElement: React.ReactElement<any>;
	let initData: InitData;
	const commonInitData = {
		apiServerEndpoint: config.apiServer,
		deviceType,
		exchanges: [] as Exchange[],
		extensionVersion: extensionVersionString,
		initialLocation: rootProps.initialLocation,
		initialShowTrackingAnimationPrompt: rootProps.initialShowTrackingAnimationPrompt,
		staticServerEndpoint: config.staticServer,
		userProfile: req.userProfile,
		version: version.app,
		webServerEndpoint: config.webServer,
	};
	switch (req.clientType) {
		case ClientType.App:
			const appPlatform =
				(req.query[appPlatformQueryStringKey] as AppPlatform) ||
				AppPlatform.Ios;
			rootElement = React.createElement(AppRoot, {
				...rootProps,
				appApi: new AppApi({
					platform: appPlatform,
				}),
				appReferral,
			});
			initData = {
				...commonInitData,
				appReferral,
				appPlatform,
				clientType: ClientType.App,
			};
			break;
		case ClientType.Browser:
			rootElement = React.createElement(BrowserRoot, {
				...rootProps,
				browserApi,
				deviceType,
				extensionApi: new ExtensionApi({
					installedVersion: extensionVersionString
						? new SemanticVersion(extensionVersionString)
						: null,
					webServerEndpoint: config.webServer,
				}),
			});
			initData = {
				...commonInitData,
				clientType: ClientType.Browser,
				extensionVersion: extensionVersionString,
			};
			break;
		default:
			res.status(400).send('Invalid clientType');
			return;
	}
	// call renderToString as many times as needed in order to capture and process all the api requests
	const render: () => Promise<string> = () =>
		req.api.processRequests().then(() => {
			const content = ReactDOMServer.renderToString(rootElement);
			if (req.api.exchanges.some((exchange) => !exchange.processed)) {
				return render();
			}
			return content;
		});

	// create response delegate
	const sendResponse = (content: string, twitterCard?: TwitterCard) => {
		// set the cache header
		res.setHeader('Cache-Control', 'no-store');
		// return the content and init data
		res.send(
			renderHtml({
				content,
				chromeExtensionId: config.chromeExtensionId,
				initData: {
					...initData,
					exchanges: req.api.exchanges,
				},
				noIndex:
					req.matchedRoute.authLevel != null ||
					(req.matchedRoute.noIndex && req.matchedRoute.noIndex(req.path)),
				staticServer: config.staticServer,
				title: browserApi.getTitle(),
				twitterCard,
				version: version.app,
			})
		);
	};
	// check if we need to render a twitter card
	switch (req.matchedRoute.screenKey) {
		case ScreenKey.Home:
			render().then((content) => {
				sendResponse(content, {
					type: TwitterCardType.App,
				});
			});
			break;
		case ScreenKey.Read:
		case ScreenKey.Comments:
			const pathParams = req.matchedRoute.getPathParams(req.path);
			Promise.all([
				req.api
					.fetchJson<TwitterCardMetadata>('GET', {
						path: '/Articles/TwitterCardMetadata',
						data: {
							postId: pathParams['commentId'],
							slug: pathParams['sourceSlug'] + '_' + pathParams['articleSlug'],
							linkType:
								req.matchedRoute.screenKey === ScreenKey.Comments
									? LinkType.Comment
									: LinkType.Read,
						} as TwitterCardMetadataRequest,
					})
					.catch(() => {
						return null as TwitterCardMetadata;
					}),
				render(),
			])
				.then((results) => {
					if (results[0]) {
						sendResponse(results[1], {
							type: TwitterCardType.Summary,
							title: results[0].title,
							description: results[0].description,
							imageUrl: results[0].imageUrl,
						});
					} else {
						sendResponse(results[1]);
					}
				})
				.catch(() => {
					sendResponse('Failed to process request.');
				});
			break;
		default:
			render().then((content) => {
				sendResponse(content);
			});
	}
});
// start the server
server.listen(config.port, () => {
	log.info(`listening on port ${config.port}`);
});
