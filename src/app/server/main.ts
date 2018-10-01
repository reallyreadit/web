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
//import routes from '../common/routes';
import * as bunyan from 'bunyan';
import * as cookieParser from 'cookie-parser';
import * as url from 'url';
import PasswordResetRequest from '../../common/models/PasswordResetRequest';
import Comment from '../../common/models/Comment';
import AppRoot from '../common/components/AppRoot';
import Captcha from './Captcha';
import BrowserRoot from '../common/components/BrowserRoot';
import LocalStorageApi from './LocalStorageApi';
import ClientType from '../common/ClientType';
import { createQueryString, clientTypeKey as clientTypeQsKey } from '../common/queryString';

// redirect helper function
const nodeUrl = url;
function redirect(req: express.Request, res: express.Response, url: string) {
	if (clientTypeQsKey in req.query) {
		const redirectUrl = nodeUrl.parse(url, true);
		redirectUrl.query[clientTypeQsKey] = req.query[clientTypeQsKey];
		url = nodeUrl.format(redirectUrl);
	}
	res.redirect(url);
}

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
if (config.contentRootPath) {
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
server = server.get(['/history', '/inbox', '/settings', '/starred'], (req, res, next) => {
	if (!req.sessionState.userAccount) {
		redirect(req, res, '/');
	} else {
		next();
	}
});
server = server.get('/admin', (req, res, next) => {
	if (
		!req.sessionState.userAccount ||
		req.sessionState.userAccount.role !== UserAccountRole.Admin
	) {
		res.sendStatus(404);
	} else {
		next();
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
/*server = server.use((req, res, next) => {
	if (routes.find(route => !!matchPath(req.path, route))) {
		next();
	} else {
		res.sendStatus(404);
	}
});*/
// render the app
server = server.get('/*', (req, res) => {
	const clientType = (req.query[clientTypeQsKey] as ClientType) || ClientType.Browser;
	const rootProps = {
		serverApi: req.api,
		captcha: new Captcha(),
		initialLocation: {
			path: req.path,
			queryString: createQueryString(req.query)
		},
		initialUser: req.sessionState.userAccount
	};
	let rootElement: React.ReactElement<any>;
	switch (clientType) {
		case ClientType.App:
			rootElement = React.createElement(
				AppRoot,
				rootProps
			);
			break;
		case ClientType.Browser:
			rootElement = React.createElement(
				BrowserRoot,
				{
					...rootProps,
					localStorageApi: new LocalStorageApi(),
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
				newReplyNotification: req.sessionState.newReplyNotification,
				initialLocation: rootProps.initialLocation,
				serverApi: req.api.getInitData(),
				userAccount: req.sessionState.userAccount,
				verifyCaptcha: config.enableCaptcha
			},
			title: ''
		}));
	});
});
// start the server
server.listen(config.port, () => {
	log.info(`listening on port ${config.port}`);
});