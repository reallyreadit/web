import * as React from 'react';
import { Route } from 'react-router';
import MainView from './components/MainView';
import HotTopicsPage from './components/HotTopicsPage';
import AboutPage from './components/AboutPage'; 
import MyAccountPage from './components/MyAccountPage'; 
import ArticlePage from './components/ArticlePage';

export default
	<Route component={MainView}>
		<Route path="/" component={HotTopicsPage} />
		<Route path="/about" component={AboutPage} />
		<Route path="/account" component={MyAccountPage} />
		<Route path="/articles/:source/:article" component={ArticlePage} />
	</Route>