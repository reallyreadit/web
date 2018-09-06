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

// redirect helper function
const nodeUrl = url;
function redirect(req: express.Request, res: express.Response, url: string) {
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
// render matched route or return 404
server = server.use((req, res, next) => {
	if (routes.find(route => !!matchPath(req.path, route))) {
		next();
	} else {
		res.sendStatus(404);
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
server = server.get(['/list', '/inbox', '/settings'], (req, res, next) => {
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
// handle token links
server = server.get(['/confirmEmail', '/resetPassword', '/viewReply'], (req, res, next) => {
	const token = req.query['token'];
	if (!token) {
		res.sendStatus(400);
	}
	switch (req.path) {
		case '/confirmEmail':
			req.api
				.fetchJson('POST', new ApiRequest('/UserAccounts/ConfirmEmail', { token }))
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
			return;
		case '/resetPassword':
			req.api
				.fetchJson<PasswordResetRequest>('GET', new ApiRequest('/UserAccounts/PasswordResetRequest', { token }))
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
			return;
		case '/viewReply':
			return;
	}
});
// handle new reply desktop notification link

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