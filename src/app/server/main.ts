import * as express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import ServerApi from './ServerApi';
import renderHtml from '../common/templates/html';
import UserAccountRole from '../../common/models/UserAccountRole';
import config from './config';
import routes from '../../common/routing/routes';
import * as bunyan from 'bunyan';
import * as cookieParser from 'cookie-parser';
import * as url from 'url';
import PasswordResetRequest from '../../common/models/PasswordResetRequest';
import CommentThread from '../../common/models/CommentThread';
import AppRoot from '../common/components/AppRoot';
import Captcha from './Captcha';
import BrowserRoot from '../common/components/BrowserRoot';
import ClientType from '../common/ClientType';
import { createQueryString, clientTypeQueryStringKey, referrerUrlQueryStringKey, marketingScreenVariantQueryStringKey, unroutableQueryStringKeys, appReferralQueryStringKey, marketingVariantQueryStringKey } from '../../common/routing/queryString';
import { findRouteByLocation, findRouteByKey } from '../../common/routing/Route';
import BrowserApi from './BrowserApi';
import AppApi from './AppApi';
import ExtensionApi from './ExtensionApi';
import ScreenKey from '../../common/routing/ScreenKey';
import * as fs from 'fs';
import VerificationTokenData from '../../common/models/VerificationTokenData';
import SemanticVersion from '../../common/SemanticVersion';
import Analytics from './Analytics';
import { variants as marketingVariants } from '../common/marketingTesting';
import UserAccount from '../../common/models/UserAccount';
import * as crypto from 'crypto';
import AppReferral from '../common/AppReferral';
import { getDeviceType } from '../common/DeviceType';

// route helper function
function findRouteByRequest(req: express.Request) {
	return findRouteByLocation(
		routes,
		{
			path: req.path,
			queryString: createQueryString(req.query)
		},
		unroutableQueryStringKeys
	);
}

// redirect helper functions
const nodeUrl = url;
function redirect(req: express.Request, res: express.Response, url: string) {
	if (clientTypeQueryStringKey in req.query) {
		const redirectUrl = nodeUrl.parse(url, true);
		url = nodeUrl.format({
			pathname: redirectUrl.pathname,
			query: {
				...redirectUrl.query,
				[clientTypeQueryStringKey]: req.query[clientTypeQueryStringKey]
			}
		})
	}
	res.redirect(url);
}
// TODO: support adding an (error) message!
function redirectToHomeScreen(req: express.Request, res: express.Response) {
	redirect(req, res, findRouteByKey(routes, ScreenKey.Home).createUrl())
}

// token helper function
// Swift URLComponents doesn't encode the plus sign like encodeURIComponent and WebUtility.UrlEncode do
function replaceSpacesWithPlusSign(token: string) {
	return token.replace(/\s/g, '+');
}

// read package.json version info
const version = JSON
	.parse(fs.readFileSync(config.packageFilePath, { encoding: 'utf8' }))
	['it.reallyread']
	.version as {
		app: string,
		contentScript: number,
		extension: string
	};

// set up logger
const log = bunyan.createLogger({
	name: 'app',
	serializers: {
		err: bunyan.stdSerializers.err,
		req: (req: Request) => ({
			method: req.method,
			url: req.url
		})
	}
});
if (config.logStream) {
	log.addStream(config.logStream);
}
// create server
let server = express();
// configure request logging
server = server.use((req, res, next) => {
	log.info({ req });
	next();
});
// configure cookie parser
server = server.use(cookieParser());
// configure static content
if (config.serveStaticContent) {
	// attempt to serve static files first
	server = server.use(express.static(config.contentRootPath));
}
// apple app site association
server = server.get('/apple-app-site-association', (req, res) => {
	res.json({
		'applinks': {
			'apps': [],
			'details': [{
				'appID': 'PRH8B2NRNT.it.reallyread.mobile',
				'paths': ['*']
			}]
		}
	});
});
// version check
server = server.get('/version', (req, res) => {
	res.status(200).send(version.app);
});
// authenticate
server = server.use((req, res, next) => {
	const clientType = (req.query[clientTypeQueryStringKey] as ClientType) || ClientType.Browser;
	const api = new ServerApi(
		config.apiServer,
		clientType,
		version.app.toString(),
		{
			key: config.cookieName,
			value: req.cookies[config.cookieName]
		}
	);
	req.api = api;
	req.clientType = clientType;
	if (api.hasAuthCookie()) {
		api
			.fetchJson<UserAccount>('GET', { path: '/UserAccounts/GetUserAccount' })
			.then(
				user => {
					if (!user) {
						throw new Error('InvalidSessionKey');
					}
					req.user = user;
					next();
				}
			)
			.catch(
				(reason: string[] | Error) => {
					if (
						(reason instanceof Array && reason.includes('Unauthenticated')) ||
						(reason instanceof Error && reason.message === 'InvalidSessionKey')
					) {
						res.clearCookie(config.cookieName, { domain: config.cookieDomain });
					}
					next();
				}
			);
	} else {
		next();
	}
});
// authorize
server = server.use((req, res, next) => {
	const route = findRouteByRequest(req);
	if (
		!route ||
		route.authLevel == null ||
		(req.user && (req.user.role === route.authLevel || req.user.role === UserAccountRole.Admin))
	) {
		next();
	} else {
		redirectToHomeScreen(req, res);
	}
});
// url migration
server = server.get('/articles/:sourceSlug/:articleSlug/:commentId?', (req, res) => {
	let params: { [key: string]: string } = {
		'sourceSlug': req.params['sourceSlug'],
		'articleSlug': req.params['articleSlug']
	};
	if (req.params['commentId']) {
		params['commentId'] = req.params['commentId'];
	}
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.Comments)
			.createUrl(params)
	);
});
server = server.get('/proof/:token', (req, res) => {
	req.api
		.fetchJson<VerificationTokenData>(
			'GET',
			{
				path: '/Articles/VerifyProofToken',
				data: { token: req.params['token'] }
			}
		)
		.then(data => {
			const slugParts = data.article.slug.split('_');
			redirect(
				req,
				res,
				findRouteByKey(routes, ScreenKey.Comments)
					.createUrl({
						'sourceSlug': slugParts[0],
						'articleSlug': slugParts[1]
					})
			);
		});
});
server = server.get('/reads', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.MyReads).createUrl()
	);
});
server = server.get('/inbox', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.Inbox).createUrl()
	);
});
server = server.get('/following', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.MyFeed).createUrl()
	);
});
server = server.get('/privacy-policy', (req, res) => {
	redirect(
		req,
		res,
		findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()
	);
});
// handle redirects
server = server.get('/confirmEmail', (req, res) => {
	req.api
		.fetchJson('POST', { path: '/UserAccounts/ConfirmEmail2', data: { token: replaceSpacesWithPlusSign(req.query['token']) } })
		.then(() => {
			redirect(req, res, '/email/confirm/success');
		})
		.catch((error: string) => {
			const redirectUrl = ({
				'AlreadyConfirmed': '/email/confirm/already-confirmed',
				'Expired': '/email/confirm/expired',
				'NotFound': '/email/confirm/not-found'
			} as { [key: string]: string })[error];
			if (redirectUrl) {
				redirect(req, res, redirectUrl);
			} else {
				redirectToHomeScreen(req, res);
			}
		});
});
server = server.get('/resetPassword', (req, res) => {
	const token = replaceSpacesWithPlusSign(req.query['token']);
	req.api
		.fetchJson<PasswordResetRequest>('GET', { path: '/UserAccounts/PasswordResetRequest2', data: { token } })
		.then(resetRequest => {
			redirect(req, res, url.format({
				pathname: '/',
				query: {
					'reset-password': '',
					'email': resetRequest.emailAddress,
					'token': token
				}
			}));
		})
		.catch((error: string) => {
			const redirectUrl = ({
				'Expired': '/password/reset/expired',
				'NotFound': '/password/reset/not-found'
			} as { [key: string]: string })[error];
			if (redirectUrl) {
				redirect(req, res, redirectUrl);
			} else {
				redirectToHomeScreen(req, res);
			}
		});
});
server = server.get('/viewReply/:id?', (req, res) => {
	let path = '/UserAccounts/ViewReply2';
	const params = {} as { [key: string]: string };
	if (req.params['id']) {
		params['id'] = req.params['id'];
	} else if (req.query['token']) {
		params['token'] = replaceSpacesWithPlusSign(req.query['token']);
	}
	req.api
		.fetchJson<CommentThread>('POST', { path, data: params })
		.then(comment => {
			const slugParts = comment.articleSlug.split('_');
			redirect(
				req,
				res,
				findRouteByKey(routes, ScreenKey.Comments)
					.createUrl({
						'sourceSlug': slugParts[0],
						'articleSlug': slugParts[1],
						'commentId': comment.id
					})
			);
		})
		.catch(() => {
			redirectToHomeScreen(req, res);
		});
});
server = server.get('/extension/uninstall', (req, res, next) => {
	if ('installationId' in req.query) {
		// log the removal
		req.api
			.logExtensionRemoval(req.query['installationId'])
			.catch(() => {});
		// clear the cookie
		res.clearCookie(
			'extensionVersion',
			{
				domain: config.cookieDomain,
				secure: config.secureCookie
			}
		);
		delete req.cookies['extensionVersion'];
	}
	next();
});
server = server.get('/mailLink/:id', (req, res) => {
	req.api
		.fetchJson('POST', { path: '/Email/Link/' + req.params['id'] })
		.then(
			(result: { url: string }) => {
				redirect(req, res, result.url);
			}
		)
		.catch(
			() => {
				redirectToHomeScreen(req, res);
			}
		);
});
// render matched route or return 404
server = server.use((req, res, next) => {
	const route = findRouteByRequest(req);
	if (route) {
		req.matchedRoute = route;
		next();
	} else {
		redirectToHomeScreen(req, res);
	}
});
// render the app
server = server.get('/*', (req, res) => {
	// session id
	if (!req.cookies['sessionId']) {
		res.cookie(
			'sessionId',
			crypto
				.randomBytes(8)
				.toString('hex'),
			{
				httpOnly: true,
				domain: config.cookieDomain,
				secure: config.secureCookie,
				sameSite: 'none'
			}
		);
	}
	// app referral
	let appReferral: AppReferral & { marketingVariant?: number };
	if (req.query[appReferralQueryStringKey]) {
		try {
			appReferral = JSON.parse(req.query[appReferralQueryStringKey]);
		} catch {
			appReferral = { };
		}
	} else if (
		req.query[marketingScreenVariantQueryStringKey] &&
		req.query[referrerUrlQueryStringKey]
	) {
		// legacy
		appReferral = {
			marketingVariant: parseInt(req.query[marketingScreenVariantQueryStringKey]),
			referrerUrl: req.query[referrerUrlQueryStringKey]
		};
	} else {
		appReferral = { };
	}
	// marketing testing
	const marketingVariantKeys = Object
		.keys(marketingVariants)
		.map(key => parseInt(key));
	let marketingVariant: number | null;
	if (req.cookies[marketingVariantQueryStringKey]) {
		marketingVariant = parseInt(req.cookies[marketingVariantQueryStringKey]);
	} else {
		marketingVariant = appReferral.marketingVariant;
	}
	if (!marketingVariantKeys.includes(marketingVariant)) {
		marketingVariant = marketingVariantKeys[Math.floor(Math.random() * marketingVariantKeys.length)];
		res.cookie(
			marketingVariantQueryStringKey,
			marketingVariant,
			{
				maxAge: 7 * 24 * 60 * 60 * 1000,
				httpOnly: true,
				domain: config.cookieDomain,
				secure: config.secureCookie,
				sameSite: 'none'
			}
		);
	}
	// legacy
	if (req.cookies[marketingScreenVariantQueryStringKey]) {
		res.clearCookie(
			marketingScreenVariantQueryStringKey,
			{
				httpOnly: true,
				domain: config.cookieDomain,
				secure: config.secureCookie
			}
		);
	}
	// prepare props
	const deviceType = getDeviceType(req.headers['user-agent']);
	const isExtensionInstalled = 'extensionVersion' in req.cookies;
	const browserApi = new BrowserApi();
	const rootProps = {
		analytics: new Analytics(),
		captcha: new Captcha(),
		initialLocation: {
			path: req.path,
			queryString: createQueryString(req.query)
		},
		initialUser: req.user,
		marketingVariant,
		serverApi: req.api,
		version: new SemanticVersion(version.app),
		webServerEndpoint: config.webServer
	};
	// create root element
	let rootElement: React.ReactElement<any>;
	switch (req.clientType) {
		case ClientType.App:
			rootElement = React.createElement(
				AppRoot,
				{
					...rootProps,
					appApi: new AppApi(),
					appReferral: {
						action: appReferral.action,
						initialPath: appReferral.initialPath,
						referrerUrl: appReferral.referrerUrl
					}
				}
			);
			break;
		case ClientType.Browser:
			rootElement = React.createElement(
				BrowserRoot,
				{
					...rootProps,
					browserApi,
					deviceType,
					extensionApi: new ExtensionApi({
						legacyChromeExtensionId: config.chromeExtensionId,
						isInstalled: isExtensionInstalled
					})
				}
			);
			break;
		default:
			res.status(400).send('Invalid clientType');
			return;
	}
	// call renderToString first to capture all the api requests
	ReactDOMServer.renderToString(rootElement);
	req.api.processRequests().then(() => {
		// call renderToString again to render with api request results
		const content = ReactDOMServer.renderToString(rootElement);
		// set the cache header
		res.setHeader('Cache-Control', 'no-store');
		// return the content and init data
		res.send(renderHtml({
			content,
			chromeExtensionId: config.chromeExtensionId,
			initData: {
				analyticsTrackingCode: (
					config.analyticsTrackingCodes ?
						config.analyticsTrackingCodes[req.clientType] :
						null
				),
				apiServerEndpoint: config.apiServer,
				appReferral: {
					action: appReferral.action,
					initialPath: appReferral.initialPath,
					referrerUrl: appReferral.referrerUrl
				},
				captchaSiteKey: config.captchaSiteKey,
				clientType: req.clientType,
				deviceType,
				exchanges: req.api.exchanges,
				chromeExtensionId: config.chromeExtensionId,
				marketingVariant,
				initialLocation: rootProps.initialLocation,
				isExtensionInstalled,
				userAccount: req.user,
				version: version.app,
				webServerEndpoint: config.webServer
			},
			noIndex: req.matchedRoute.authLevel != null || req.matchedRoute.noIndex,
			title: browserApi.getTitle()
		}));
	});
});
// start the server
server.listen(config.port, () => {
	log.info(`listening on port ${config.port}`);
});