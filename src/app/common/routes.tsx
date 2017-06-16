import * as React from 'react';
import { Route } from 'react-router';
import MainView from './components/MainView';
import HotTopicsPage from './components/HotTopicsPage';
import AboutPage from './components/AboutPage'; 
import ReadingListPage from './components/ReadingListPage'; 
import ArticlePage from './components/ArticlePage';
import InboxPage from './components/InboxPage';
import SettingsPage from './components/SettingsPage';
import EmailPage from './components/EmailPage';
import HowItWorksPage from './components/HowItWorksPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';

export default
	<Route component={MainView}>
		<Route path="/" component={HotTopicsPage} />
		<Route path="/about" component={AboutPage} />
		<Route path="/articles/:sourceSlug/:articleSlug(/:commentId)" component={ArticlePage} />
		<Route path="/email/:action/:result" component={EmailPage} />
		<Route path="/how-it-works" component={HowItWorksPage} />
		<Route path="/list" component={ReadingListPage} />
		<Route path="/inbox" component={InboxPage} />
		<Route path="/privacy" component={PrivacyPolicyPage} />
		<Route path="/settings" component={SettingsPage} />
	</Route>