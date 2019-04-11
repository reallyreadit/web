import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import IframeMessagingContext from './IframeMessagingContext';

ReactDOM.render(
	React.createElement(
		App,
		{
			contentScript: new IframeMessagingContext(
				window.parent,
				decodeURIComponent(window.location.hash.substr(1))
			) 
		}
	),
	document.getElementById('root')
);