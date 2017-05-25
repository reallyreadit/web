import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../common/components/App';
import BrowserApi from './BrowserApi';
import BrowserPage from './BrowserPage';
import { Router, browserHistory } from 'react-router';
import routes from '../common/routes';
import BrowserUser from './BrowserUser';
import BrowserExtension from './BrowserExtension';

const api = new BrowserApi(window._apiEndpoint, window._apiInitData),
	page = new BrowserPage(window._pageInitData);

ReactDOM.render(
	React.createElement(
		App,
		{
			api,
			page,
			user: new BrowserUser(window._userInitData),
			extension: new BrowserExtension(window._extensionId),
			environment: 'browser'
		},
		React.createElement(
			Router,
			{ history: browserHistory },
			routes
		)
	),
	document.getElementById('root')
);

api.initialize();
page.initialize();