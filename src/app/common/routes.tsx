import * as React from 'react';
import { Route } from 'react-router';
import MainView from './components/MainView';
import HotTopicsPage from './components/HotTopicsPage';
import AboutPage from './components/AboutPage'; 
import ReadingListPage from './components/ReadingListPage'; 
import ArticlePage from './components/ArticlePage';
import InboxPage from './components/InboxPage';
import SettingsPage from './components/SettingsPage';

export default
	<Route component={MainView}>
		<Route path="/" component={HotTopicsPage} />
		<Route path="/about" component={AboutPage} />
		<Route path="/articles/:source/:article" component={ArticlePage} />
		<Route path="/list" component={ReadingListPage} />
		<Route path="/inbox" component={InboxPage} />
		<Route path="/settings" component={SettingsPage} />
	</Route>