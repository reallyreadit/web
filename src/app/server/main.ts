import * as express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import ServerApi from './ServerApi';
import renderHtml from '../common/templates/html';
import UserAccountRole from '../../common/models/UserAccountRole';
import SessionState from '../../common/models/SessionState';
import ApiRequest from '../common/serverApi/Request';
import config from './config';
import { hasNewUnreadReply } from '../../common/models/NewReplyNotification';
import routes from '../../common/routing/routes';
import * as bunyan from 'bunyan';
import * as cookieParser from 'cookie-parser';
import * as url from 'url';
import PasswordResetRequest from '../../common/models/PasswordResetRequest';
import Comment from '../../common/models/Comment';
import AppRoot from '../common/components/AppRoot';
import Captcha from './Captcha';
import BrowserRoot from '../common/components/BrowserRoot';
import ClientType from '../common/ClientType';
import { createQueryString, clientTypeQueryStringKey } from '../../common/routing/queryString';
import { findRouteByLocation, findRouteByKey } from '../../common/routing/Route';
import BrowserApi from './BrowserApi';
import AppApi from './AppApi';
import ExtensionApi from './ExtensionApi';
import ScreenKey from '../../common/routing/ScreenKey';
import * as fs from 'fs';
import * as path from 'path';

// route helper function
function findRouteByRequest(req: express.Request) {
	return findRouteByLocation(
		routes,
		{
			path: req.path,
			queryString: createQueryString(req.query)
		},
		[clientTypeQueryStringKey]
	);
}

// redirect helper function
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

// read package.json version info
const version = JSON
	.parse(fs.readFileSync(config.packageFilePath, { encoding: 'utf8' }))
	['it.reallyread']
	.version as {
		app: number,
		contentScript: number,
		extension: number
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
	res.status(200).send(version.app.toString());
});
// app content script updating
server = server.get('/contentScript', (req, res) => {
	if (!req.query['currentVersion'] || parseFloat(req.query['currentVersion']) < version.contentScript) {
		res.setHeader('X-ReallyReadIt-Version', version.contentScript);
		res.sendFile(
			path.join(config.contentRootPath, 'assets', 'contentScript'),
			{
				headers: { 'Content-Type': 'text/plain' },
				root: '.'
			}
		);
	} else {
		res.sendStatus(200);
	}
});
// authenticate
server = server.use((req, res, next) => {
	const api = new ServerApi({
		scheme: config.api.protocol,
		host: config.api.host,
		port: config.api.port
	}, {
		key: config.cookieName,
		value: req.cookies[config.cookieName]
	});
	req.api = api;
	if (api.hasAuthCookie()) {
		api.fetchJson<SessionState>('GET', new ApiRequest('/UserAccounts/GetSessionState'))
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
	} else if (route.authLevel === UserAccountRole.Admin) {
		res.sendStatus(404);
	} else {
		redirect(req, res, findRouteByKey(routes, ScreenKey.Home).createUrl());
	}
});
// handle redirects
server = server.get('/confirmEmail', (req, res) => {
	req.api
		.fetchJson('POST', new ApiRequest('/UserAccounts/ConfirmEmail2', { token: req.query['token'] }))
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
				res.sendStatus(400);
			}
		});
});
server = server.get('/resetPassword', (req, res) => {
	req.api
		.fetchJson<PasswordResetRequest>('GET', new ApiRequest('/UserAccounts/PasswordResetRequest2', { token: req.query['token'] }))
		.then(resetRequest => {
			redirect(req, res, url.format({
				pathname: '/',
				query: {
					'reset-password': '',
					'email': resetRequest.emailAddress,
					'token': req.query['token']
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
				res.sendStatus(400);
			}
		});
});
server = server.get('/viewReply/:id?', (req, res) => {
	let path = '/UserAccounts/ViewReply2';
	const params = {} as { [key: string]: string };
	if (req.params['id']) {
		params['id'] = req.params['id'];
	} else if (req.query['token']) {
		params['token'] = req.query['token'];
	}
	req.api
		.fetchJson<Comment>('POST', new ApiRequest(path, params))
		.then(comment => {
			const slugParts = comment.articleSlug.split('_');
			redirect(req, res, `/articles/${slugParts[0]}/${slugParts[1]}/${comment.id}`);
		})
		.catch(() => {
			res.sendStatus(400);
		});
});
// ack new reply notification
server = server.get('/inbox', (req, res, next) => {
	if (hasNewUnreadReply(req.sessionState.newReplyNotification)) {
		req.api
			.ackNewReply()
			.then(next);
	} else {
		next();
	}
});
// render matched route or return 404
server = server.use((req, res, next) => {
	if (findRouteByRequest(req)) {
		next();
	} else {
		res.sendStatus(404);
	}
});
// render the app
server = server.get('/*', (req, res) => {
	const browserApi = new BrowserApi();
	const clientType = (req.query[clientTypeQueryStringKey] as ClientType) || ClientType.Browser;
	const rootProps = {
		captcha: new Captcha(),
		initialLocation: {
			path: req.path,
			queryString: createQueryString(req.query)
		},
		initialUser: req.sessionState.userAccount,
		serverApi: req.api,
		version: version.app
	};
	let rootElement: React.ReactElement<any>;
	switch (clientType) {
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
		if (config.cacheEnabled && !req.sessionState.userAccount) {
			res.setHeader('Cache-Control', 'max-age=5');
		}
		// return the content and init data
		res.send(renderHtml({
			content,
			enableAnalytics: config.enableAnalytics,
			enableCaptcha: config.enableCaptcha,
			extensionId: config.extensionId,
			initData: {
				clientType,
				extensionId: config.extensionId,
				newReplyNotification: req.sessionState.newReplyNotification,
				initialLocation: rootProps.initialLocation,
				serverApi: req.api.getInitData(),
				userAccount: req.sessionState.userAccount,
				verifyCaptcha: config.enableCaptcha,
				version: version.app
			},
			title: browserApi.getTitle()
		}));
	});
});
// start the server
server.listen(config.port, () => {
	log.info(`listening on port ${config.port}`);
});