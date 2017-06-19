import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../common/components/App';
import BrowserApi from './BrowserApi';
import BrowserPage from './BrowserPage';
import { Router, browserHistory } from 'react-router';
import routes from '../common/routes';
import BrowserUser from './BrowserUser';
import BrowserExtension from './BrowserExtension';
require('snapsvg');

const api = new BrowserApi(window._contextInitData.api),
	page = new BrowserPage(window._contextInitData.page);

ReactDOM.render(
	React.createElement(
		App,
		{
			api,
			environment: 'browser',
			extension: new BrowserExtension(window._contextInitData.extension),
			page,
			user: new BrowserUser(window._contextInitData.user)
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