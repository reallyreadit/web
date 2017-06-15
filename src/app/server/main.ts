import * as express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import App from '../common/components/App';
import ServerApi from './ServerApi';
import ServerPage from './ServerPage';
import renderHtml from '../common/templates/html';
import { RouterContext, match } from 'react-router';
import routes from '../common/routes';
import ServerUser from './ServerUser';
import SessionState from '../../common/models/SessionState';
import Request from '../common/api/Request';
import config from './config';
import ServerExtension from './ServerExtension';
import { hasNewUnreadReply } from '../../common/models/NewReplyNotification';

express()
	// attempt to serve static files first
	.use(express.static(config.contentRootPath))
	// render matched route or return 404
	.use((req, res, next) => {
		match({ routes, location: req.url }, (error, nextLocation, nextState) => {
			if (!nextState) {
				res.sendStatus(404);
			} else {
				req.nextState = nextState;
				next();
			}
		});
	})
	// authenticate
	.use((req, res, next) => {
		const api = new ServerApi({
			scheme: config.api.protocol,
			host: config.api.host,
			port: config.api.port
		}, req.headers['cookie']);
		req.api = api;
		if (api.hasSessionKey()) {
			api.fetchJson('GET', new Request('/UserAccounts/GetSessionState'))
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
						res.clearCookie('sessionKey', { domain: config.cookieDomain });
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
	})
	// authorize
	.get(['/list', '/inbox', '/settings'], (req, res, next) => {
		if (!req.sessionState) {
			res.redirect('/');
		} else {
			next();
		}
	})
	// ack new reply notification
	.get('/inbox', (req, res, next) => {
		if (req.sessionState.newReplyNotification && hasNewUnreadReply(req.sessionState.newReplyNotification)) {
			req.api
				.ackNewReply()
				.then(next);
		} else {
			next();
		}
	})
	// render the app
	.get('/*', (req, res) => {
		const user = new ServerUser(req.sessionState.userAccount),
			page = new ServerPage(req.sessionState.newReplyNotification),
			extension = new ServerExtension(config.extensionId),
			appElement = React.createElement(
				App,
				{
					api: req.api,
					environment: 'server',
					extension,
					page,
					user
				},
				React.createElement(RouterContext, req.nextState)
			);
		// call renderToString first to capture all the api requests
		ReactDOMServer.renderToString(appElement);
		req.api.processRequests().then(() => {
			// call renderToString again to render with api request results
			ReactDOMServer.renderToString(appElement);
			// one more call is needed since the page title renders before
			// the pages which in turn set the page title in any async manner
			const content = ReactDOMServer.renderToString(appElement);
			// return the content and init data
			res.send(renderHtml({
				title: page.title,
				content,
				extensionId: config.extensionId,
				contextInitData: {
					api: req.api.getInitData(),
					extension: extension.getInitData(),
					page: page.getInitData(),
					user: user.getInitData()
				}
			}));
		});
	})
	.listen(config.port, () => {
		console.log(`listening on port ${config.port}`);
	});