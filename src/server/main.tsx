import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import App from '../common/App';
import ServerApi from './ServerApi';
import ServerPageTitle from './ServerPageTitle';
import renderHtml from '../common/templates/html';
import { RouterContext, match } from 'react-router';
import routes from '../common/routes';
import ServerUser from './ServerUser';
import UserAccount from '../common/api/models/UserAccount';
import Request from '../common/api/Request';
import Session from '../common/api/models/Session';

const port = 5000;

http.createServer((req, res) => {
		if (/\.(js|css|map|ttf|ico)$/.test(req.url)) {
			fs.readFile(`.${req.url}`, (error, content) => {
				if (error) {
					res.writeHead(500);
					res.end('Error 500');
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
			match({ routes, location: req.url }, (error, nextLocation, nextState) => {
				const api = new ServerApi({
						scheme: 'http',
						host: 'localhost',
						port: 4001
					}),
					pageTitle = new ServerPageTitle();
				new Promise<UserAccount>((resolve, reject) => {
						if (req.headers['cookie'] !== undefined) {
							// TODO: FIX THIS
							api.getJson(new Request(`/UserAccounts/GetSession?${req.headers['cookie']}`))
								.then((session: Session) => session !== null ?
									resolve({
										id: session.userAccountId,
										name: session.userAccountName,
										email: session.userAccountEmail
									}) :
									resolve(undefined));
						} else {
							resolve(undefined);
						}
					})
					.then(userAccount => {
						const user = new ServerUser(userAccount);
						ReactDOMServer.renderToString(
							<App api={api} pageTitle={pageTitle} user={user}>
								<RouterContext {...nextState} />
							</App>
						);
						api.processRequests().then(() => {
							res.setHeader('content-type', 'text/html');
							res.end(renderHtml({
								title: pageTitle.get(),
								content: ReactDOMServer.renderToString(
									<App api={api} pageTitle={pageTitle} user={user}>
										<RouterContext {...nextState} />
									</App>
								),
								apiEndpoint: api.getEndpoint(),
								apiInitData: api.getInitData(),
								userInitData: user.getInitData()
							}));
						});
					});
			});
		}
	})
	.listen(port);

console.log(`listening on port ${port}`);