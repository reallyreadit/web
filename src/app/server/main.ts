import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
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

const port = 5000;

http.createServer((req, res) => {
		if (/\.(js|css|map|ttf|ico)$/.test(req.url)) {
			// serve static content
			fs.readFile(`.${req.url}`, (error, content) => {
				if (error) {
					res.writeHead(500);
					res.end('Server Error');
				} else {
					let contentType: string;
					switch (path.extname(url.parse(req.url).pathname)) {
						case '.js':
							contentType = 'text/javascript';
							break;
						case '.css':
							contentType = 'text/css';
							break;
						case '.map':
							contentType = 'application/json';
							break;
						case '.ttf':
							contentType = 'application/x-font-ttf';
							break;
						case '.ico':
							contentType = 'image/x-icon';
							break;
					}
					res.setHeader('content-type', contentType);
					res.end(content, 'utf-8');
				}
			});
		} else {
			// match route
			match({ routes, location: req.url }, (error, nextLocation, nextState) => {
				// setup api and page context components
				const api = new ServerApi({
						scheme: 'http',
						host: 'localhost',
						port: 4001
					}, req.headers['cookie']),
					page = new ServerPage();
				// get user account if session key cookie is present
				new Promise<UserAccount>((resolve, reject) => {
						if (api.hasSessionKey()) {
							api.getJson(new Request('/UserAccounts/GetUserAccount'))
								.then((userAccount: UserAccount) => {
									// clear the cookie if it's invalid
									if (!userAccount) {
										res.setHeader('Set-Cookie', `sessionKey=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${config.cookieDomain}; path=/`);
									}
									resolve(userAccount);
								});
						} else {
							resolve();
						}
					})
					.then(userAccount => {
						const reqPath = url.parse(req.url).pathname;
						// redirect to home page if requesting a section that requires authentication without authentication
						if (!userAccount && ['/list', '/inbox', '/settings'].indexOf(reqPath) !== -1) {
							res.writeHead(302, { 'Location': '/' });
							res.end();
						} else {
							// ack new reply notification if a logged in user is hitting the inbox
							if (userAccount && reqPath === '/inbox') {
								// TODO: need to implement POST in ServerApi
							}
							// render the app
							const user = new ServerUser(userAccount),
								appElement = React.createElement(
										App,
										{
											api,
											page,
											user,
											extension: new ServerExtension(),
											environment: 'server'
										},
										React.createElement(RouterContext, nextState)
									);
							// call renderToString first to capture all the api requests
							ReactDOMServer.renderToString(appElement);
							api.processRequests().then(() => {
								// call renderToString again to render with api request results
								ReactDOMServer.renderToString(appElement);
								// one more call is needed since the page title renders before
								// the pages which in turn set the page title in any async manner
								const content = ReactDOMServer.renderToString(appElement);
								// return the content and init data
								res.setHeader('content-type', 'text/html');
								res.end(renderHtml({
									content,
									pageInitData: page.getInitData(),
									contentRootPath: config.contentRootPath,
									apiEndpoint: {
										scheme: config.api.protocol,
										host: config.api.host,
										port: config.api.port
									},
									apiInitData: api.getInitData(),
									userInitData: user.getInitData(),
									extensionId: config.extensionId
								}));
							});
						}
					});
			});
		}
	})
	.listen(port);

console.log(`listening on port ${port}`);