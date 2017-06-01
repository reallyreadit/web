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
import UserAccount from '../common/api/models/UserAccount';
import Request from '../common/api/Request';
import config from './config';
import ServerExtension from './ServerExtension';

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
			scheme: 'http',
			host: 'localhost',
			port: 4001
		}, req.headers['cookie']);
		req.api = api;
		if (api.hasSessionKey()) {
			api.getJson(new Request('/UserAccounts/GetUserAccount'))
				.then((userAccount: UserAccount) => {
					if (!userAccount) {
						throw new Error('AccountNotFound');
					}
					req.userAccount = userAccount;
					next();
				})
				.catch((reason: string[] | Error) => {
					if (
						(reason instanceof Array && reason.includes('Unauthenticated')) ||
						(reason instanceof Error && reason.message === 'AccountNotFound')
					) {
						res.clearCookie('sessionKey', { domain: config.cookieDomain });
					}
					next();
				});
		} else {
			next();
		}
	})
	// authorize
	.get(['/list', '/inbox', '/settings'], (req, res, next) => {
		if (!req.userAccount) {
			res.redirect('/');
		} else {
			next();
		}
	})
	// ack new reply notification
	.get('/inbox', (req, res, next) => {
		// TODO: implement POST in ServerApi and ack new reply notification
		next();
	})
	// render the app
	.get('/*', (req, res) => {
		const user = new ServerUser(req.userAccount),
			page = new ServerPage(),
			appElement = React.createElement(
				App,
				{
					api: req.api,
					page,
					user,
					extension: new ServerExtension(),
					environment: 'server'
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
				content,
				pageInitData: page.getInitData(),
				apiEndpoint: {
					scheme: config.api.protocol,
					host: config.api.host,
					port: config.api.port
				},
				apiInitData: req.api.getInitData(),
				userInitData: user.getInitData(),
				extensionId: config.extensionId
			}));
		});
	})
	.listen(config.port, () => {
		console.log(`listening on port ${config.port}`);
	});