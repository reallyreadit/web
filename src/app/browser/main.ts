import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../common/App';
import BrowserApi from './BrowserApi';
import BrowserPageTitle from './BrowserPageTitle';
import { Router, browserHistory } from 'react-router';
import routes from '../common/routes';
import BrowserUser from './BrowserUser';
import BrowserExtension from './BrowserExtension';

const api = new BrowserApi(window._apiEndpoint, window._apiInitData),
	  pageTitle = new BrowserPageTitle(document.title);

ReactDOM.render(
	React.createElement(
		App,
		{
			api,
			pageTitle,
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
pageTitle.initialize();