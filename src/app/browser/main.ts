import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../common/components/App';
import BrowserApi from './BrowserApi';
import BrowserPage from './BrowserPage';
import { BrowserRouter } from 'react-router-dom';
import MainView from '../common/components/MainView';
import BrowserUser from './BrowserUser';
import BrowserExtension from './BrowserExtension';
import browserLogger from './BrowserLogger';
import BrowserApp from './BrowserApp';
require('snapsvg');

// analytics
ga('create', {
	trackingId: 'UA-101617933-1',
	cookieDomain: 'auto',
	userId: window._contextInitData.user ? window._contextInitData.user.id : null
});
ga('send', 'pageview');

// app
const
	api = new BrowserApi(window._contextInitData.api),
	page = new BrowserPage(window._contextInitData.page);

ReactDOM.render(
	React.createElement(
		App,
		{
			api,
			app: new BrowserApp(window._contextInitData.environment),
			environment: window._contextInitData.environment,
			extension: new BrowserExtension(window._contextInitData.extension),
			page,
			user: new BrowserUser(window._contextInitData.user),
			log: browserLogger
		},
		React.createElement(BrowserRouter, {}, React.createElement(MainView))
	),
	document.getElementById('root')
);

api.initialize();
page.initialize();