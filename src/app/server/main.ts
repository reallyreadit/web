import * as express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import ServerApi from './ServerApi';
import renderHtml from '../common/templates/html';
import UserAccountRole from '../../common/models/UserAccountRole';
import SessionState from '../../common/models/SessionState';
import config from './config';
import { hasNewUnreadReply } from '../../common/models/NewReplyNotification';
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
import { createQueryString, clientTypeQueryStringKey, redirectedQueryStringKey } from '../../common/routing/queryString';
import { findRouteByLocation, findRouteByKey } from '../../common/routing/Route';
import BrowserApi from './BrowserApi';
import AppApi from './AppApi';
import ExtensionApi from './ExtensionApi';
import ScreenKey from '../../common/routing/ScreenKey';
import * as fs from 'fs';
import * as path from 'path';
import VerificationTokenData from '../../common/models/VerificationTokenData';
import DeviceType from '../common/DeviceType';
import SemanticVersion from '../../common/SemanticVersion';
import Analytics from './Analytics';

// route helper function
function findRouteByRequest(req: express.Request) {
	return findRouteByLocation(
		routes,
		{
			path: req.path,
			queryString: createQueryString(req.query)
		},
		[clientTypeQueryStringKey, redirectedQueryStringKey]
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
	return token.replace(' ', '+');
}

// cloudfront device type headers
const deviceTypeHeaderMap: { [key: string]: DeviceType } = {
	'CloudFront-Is-Desktop-Viewer': DeviceType.Desktop,
	'CloudFront-Is-Mobile-Viewer': DeviceType.Mobile,
	'CloudFront-Is-SmartTV-Viewer': DeviceType.SmartTV,
	'CloudFront-Is-Tablet-Viewer': DeviceType.Tablet
};

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
// app content script updating
server = server.get('/assets/update/contentScript', (req, res) => {
	if (!req.query['currentVersion'] || parseFloat(req.query['currentVersion']) < version.contentScript) {
		res.setHeader('X-ReallyReadIt-Version', version.contentScript);
		res.sendFile(
			path.posix.join('assets', 'contentScript'),
			{
				headers: { 'Content-Type': 'text/plain' },
				root: config.contentRootPath
			}
		);
	} else {
		res.sendStatus(200);
	}
});
server = server.get('/assets/update/ContentScript.js', (req, res) => {
	if (parseFloat(req.query['currentVersion']) < version.contentScript) {
		res.setHeader('X-ReallyReadIt-Version', version.contentScript);
		res.sendFile(
			path.posix.join('assets', 'ContentScript.js'),
			{
				headers: { 'Content-Type': 'text/plain' },
				root: config.contentRootPath
			}
		);
	} else {
		res.sendStatus(200);
	}
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
		api.fetchJson<SessionState>('GET', { path: '/UserAccounts/GetSessionState' })
			.then(sessionState => {
				if (!sessionState) {
					throw new Error('InvalidSessionKey');
				}
				req.sessionState = sessionState;
				next();
			})
			.catch((reason: string[] | Error) => {
				if (
					(reason instanceof Array && reason.includes('Unauthenticated')) ||
					(reason instanceof Error && reason.message === 'InvalidSessionKey')
				) {
					res.clearCookie(config.cookieName, { domain: config.cookieDomain });
				}
				req.sessionState = {
					userAccount: null,
					newReplyNotification: null
				};
				next();
			});
	} else {
		req.sessionState = {
			userAccount: null,
			newReplyNotification: null
		};
		next();
	}
});
// authorize
server = server.use((req, res, next) => {
	const route = findRouteByRequest(req);
	if (
		!route ||
		route.authLevel == null ||
		(req.sessionState.userAccount && (req.sessionState.userAccount.role === route.authLevel || req.sessionState.userAccount.role === UserAccountRole.Admin))
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
	req.api
		.fetchJson<PasswordResetRequest>('GET', { path: '/UserAccounts/PasswordResetRequest2', data: { token: req.query['token'] } })
		.then(resetRequest => {
			redirect(req, res, url.format({
				pathname: '/',
				query: {
					'reset-password': '',
					'email': resetRequest.emailAddress,
					'token': replaceSpacesWithPlusSign(req.query['token'])
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
// process GET side effects
server = server.get('/inbox', (req, res, next) => {
	if (hasNewUnreadReply(req.sessionState.newReplyNotification)) {
		req.api
			.ackNewReply()
			.then(() => {
				const now = Date.now();
				req.sessionState.newReplyNotification = {
					...req.sessionState.newReplyNotification,
					lastNewReplyAck: now,
					timestamp: now
				};
				next();
			});
	} else {
		next();
	}
});
server = server.get('/extension/uninstall', (req, res, next) => {
	if ('installationId' in req.query) {
		req.api
			.logExtensionRemoval(req.query['installationId'])
			.catch(() => {});
	}
	next();
});
// render matched route or return 404
server = server.use((req, res, next) => {
	if (findRouteByRequest(req)) {
		next();
	} else {
		redirectToHomeScreen(req, res);
	}
});
// render the app
server = server.get('/*', (req, res) => {
	// prepare props
	const browserApi = new BrowserApi();
	const deviceType = (
		Object
			.keys(deviceTypeHeaderMap)
			.reduce(
				(deviceType, header) => {
					if (req.header(header) === 'true') {
						deviceType |= deviceTypeHeaderMap[header];
					}
					return deviceType;
				},
				DeviceType.None
			) ||
			DeviceType.Desktop
	);
	const rootProps = {
		analytics: new Analytics(),
		captcha: new Captcha(),
		initialLocation: {
			path: req.path,
			queryString: createQueryString(req.query)
		},
		initialUser: req.sessionState.userAccount,
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
					appApi: new AppApi()
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
					extensionApi: new ExtensionApi(config.extensionId),
					newReplyNotification: req.sessionState.newReplyNotification
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
			extensionId: config.extensionId,
			initData: {
				analyticsTrackingCode: (
					config.analyticsTrackingCodes ?
						config.analyticsTrackingCodes[req.clientType] :
						null
				),
				apiServerEndpoint: config.apiServer,
				captchaSiteKey: config.captchaSiteKey,
				clientType: req.clientType,
				deviceType,
				exchanges: req.api.exchanges,
				extensionId: config.extensionId,
				newReplyNotification: req.sessionState.newReplyNotification,
				initialLocation: rootProps.initialLocation,
				userAccount: req.sessionState.userAccount,
				version: version.app,
				webServerEndpoint: config.webServer
			},
			title: browserApi.getTitle()
		}));
	});
});
// start the server
server.listen(config.port, () => {
	log.info(`listening on port ${config.port}`);
});