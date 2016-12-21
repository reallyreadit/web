import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from '../common/App';
import BrowserApi from './BrowserApi';
import BrowserPageTitle from './BrowserPageTitle';
import { Router, browserHistory } from 'react-router';
import routes from '../common/routes';
import BrowserUser from './BrowserUser';

const api = new BrowserApi(window._apiEndpoint, window._apiInitData),
	  pageTitle = new BrowserPageTitle(document.title);

ReactDOM.render(
	<App api={api} pageTitle={pageTitle} user={new BrowserUser(window._userInitData)}>
		<Router history={browserHistory}>
			{routes}
		</Router>
	</App>,
	document.getElementById('root')
);

api.initialize();
pageTitle.initialize();