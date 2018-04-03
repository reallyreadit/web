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
import Environment from '../common/Environment';

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
	}, req.headers['cookie']);
	req.api = api;
	if (api.hasSessionKey()) {
		api.fetchJson('GET', new ApiRequest('/UserAccounts/GetSessionState'))
			.then((sessionState: SessionState) => {
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
		res.redirect('/');
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
	const user = new ServerUser(req.sessionState.userAccount),
		page = new ServerPage(req.sessionState.newReplyNotification),
		extension = new ServerExtension(config.extensionId),
		appElement = React.createElement(
			App,
			{
				api: req.api,
				environment: Environment.Server,
				extension,
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
		ReactDOMServer.renderToString(appElement);
		// one more call is needed since the page title renders before
		// the pages which in turn set the page title in any async manner
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
				environment: req.query.mode === 'app' ? Environment.App : Environment.Browser,
				extension: extension.getInitData(),
				page: page.getInitData(),
				user: user.getInitData()
			},
			enableAnalytics: config.enableAnalytics
		}));
	});
});
// start the server
server.listen(config.port, () => {
	log.info(`listening on port ${config.port}`);
});