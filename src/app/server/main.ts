import * as express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import App from '../common/components/App';
import ServerApi from './ServerApi';
import ServerPage from './ServerPage';
import renderHtml from '../common/templates/html';
import { StaticRouter, matchPath } from 'react-router';
import MainView from '../common/components/MainView';
import ServerUser from './ServerUser';
import UserAccountRole from '../../common/models/UserAccountRole';
import SessionState from '../../common/models/SessionState';
import ApiRequest from '../common/api/Request';
import config from './config';
import ServerExtension from './ServerExtension';
import { hasNewUnreadReply } from '../../common/models/NewReplyNotification';
import routes from '../common/routes';
import * as bunyan from 'bunyan';
import ServerApp from './ServerApp';
import ServerEnvironment from './ServerEnvironment';
import ClientType from '../common/ClientType';
import ChallengeState from '../../common/models/ChallengeState';
import ServerChallenge from './ServerChallenge';
import ServerCaptcha from './ServerCaptcha';
import * as cookieParser from 'cookie-parser';
import * as url from 'url';
import PasswordResetRequest from '../../common/models/PasswordResetRequest';
import Comment from '../../common/models/Comment';

// redirect helper function
const nodeUrl = url;
function redirectWithMode(req: express.Request, res: express.Response, url: string) {
	if (req.query['mode']) {
		const redirectUrl = nodeUrl.parse(url, true);
		redirectUrl.query['mode'] = req.query['mode'];
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
server = server.get(['/list', '/inbox', '/settings'], (req, res, next) => {
	if (!req.sessionState.userAccount) {
		redirectWithMode(req, res, '/');
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
			redirectWithMode(req, res, '/email/confirm/success');
		})
		.catch((error: string) => {
			const redirectUrl = ({
				'AlreadyConfirmed': '/email/confirm/already-confirmed',
				'Expired': '/email/confirm/expired',
				'NotFound': '/email/confirm/not-found'
			} as { [key: string]: string })[error];
			if (redirectUrl) {
				redirectWithMode(req, res, redirectUrl);
			} else {
				res.sendStatus(400);
			}
		});
});
server = server.get('/resetPassword', (req, res) => {
	req.api
		.fetchJson<PasswordResetRequest>('GET', new ApiRequest('/UserAccounts/PasswordResetRequest2', { token: req.query['token'] }))
		.then(resetRequest => {
			redirectWithMode(req, res, url.format({
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
				redirectWithMode(req, res, redirectUrl);
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
			redirectWithMode(req, res, `/articles/${slugParts[0]}/${slugParts[1]}/${comment.id}`);
		})
		.catch(() => {
			res.sendStatus(400);
		});
});
// challenge
server = server.use((req, res, next) => {
	req
		.api
		.fetchJson<ChallengeState>('GET', new ApiRequest('/Challenges/State'))
		.then(challengeState => {
			req.challengeState = challengeState;
			next();
		})
		.catch(() => {
			req.challengeState = {
				activeChallenge: null,
				latestResponse: null,
				score: null
			};
			next();
		});
});
// ack new reply notification
server = server.get('/inbox', (req, res, next) => {
	if (req.sessionState.newReplyNotification && hasNewUnreadReply(req.sessionState.newReplyNotification)) {
		req.api
			.ackNewReply()
			.then(next);
	} else {
		next();
	}
});
// render matched route or return 404
server = server.use((req, res, next) => {
	if (routes.find(route => !!matchPath(req.path, route))) {
		next();
	} else {
		res.sendStatus(404);
	}
});
// render the app
server = server.get('/*', (req, res) => {
	const
		challenge = new ServerChallenge(req.challengeState),
		environment = new ServerEnvironment(
			req.query.mode === 'app' ? ClientType.App : ClientType.Browser,
			new ServerApp(),
			new ServerExtension(config.extensionId)
		),
		user = new ServerUser(req.sessionState.userAccount),
		page = new ServerPage(req.sessionState.newReplyNotification, !req.cookies['hideHero']),
		appElement = React.createElement(
			App,
			{
				api: req.api,
				captcha: new ServerCaptcha(),
				challenge,
				environment,
				page,
				user,
				log
			},
			React.createElement(
				StaticRouter,
				{
					location: req.url,
					context: {}
				},
				React.createElement(MainView)
			)
		);
	// call renderToString first to capture all the api requests
	ReactDOMServer.renderToString(appElement);
	req.api.processRequests().then(() => {
		// call renderToString again to render with api request results
		const content = ReactDOMServer.renderToString(appElement);
		// set the cache header
		if (config.cacheEnabled && !req.sessionState.userAccount) {
			res.setHeader('Cache-Control', 'max-age=5');
		}
		// return the content and init data
		res.send(renderHtml({
			title: page.title,
			content,
			extensionId: config.extensionId,
			contextInitData: {
				api: req.api.getInitData(),
				captcha: config.enableCaptcha,
				challenge: challenge.getInitData(),
				environment: environment.getInitData(),
				page: page.getInitData(),
				user: user.getInitData()
			},
			enableAnalytics: config.enableAnalytics,
			enableCaptcha: config.enableCaptcha
		}));
	});
});
// start the server
server.listen(config.port, () => {
	log.info(`listening on port ${config.port}`);
});