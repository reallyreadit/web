import * as React from 'react';
import { Route } from 'react-router';
import MainView from './components/MainView';
import Articles from './components/Articles';
import About from './components/About'; 
import MyAccount from './components/MyAccount'; 

export default
	<Route component={MainView}>
		<Route path="/" component={Articles} />
		<Route path="/about" component={About} />
		<Route path="/account" component={MyAccount} />
	</Route>