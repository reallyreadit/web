import { RouteProps } from 'react-router';
import HotTopicsPage from './components/HotTopicsPage';
import AboutPage from './components/AboutPage';
import ReadingListPage from './components/ReadingListPage';
import ArticlePage from './components/ArticlePage';
import InboxPage from './components/InboxPage';
import SettingsPage from './components/SettingsPage';
import EmailPage from './components/EmailPage';
import HowItWorksPage from './components/HowItWorksPage';
import PasswordPage from './components/PasswordPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';

export default [
	{
		exact: true,
		path: '/',
		component: HotTopicsPage
	},
	{
		path: '/about',
		component: AboutPage
	},
	{
		path: '/articles/:sourceSlug/:articleSlug/:commentId?',
		component: ArticlePage
	},
	{
		path: '/email/:action/:result',
		component: EmailPage
	},
	{
		path: '/how-it-works',
		component: HowItWorksPage
	},
	{
		path: '/list',
		component: ReadingListPage
	},
	{
		path: '/inbox',
		component: InboxPage
	},
	{
		path: '/password/:action/:result',
		component: PasswordPage
	},
	{
		path: '/privacy',
		component: PrivacyPolicyPage
	},
	{
		path: '/settings',
		component: SettingsPage
	}
] as RouteProps[];