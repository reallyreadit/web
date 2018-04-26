import { RouteProps } from 'react-router';
import HotTopicsPage from './components/HotTopicsPage';
import AboutPage from './components/AboutPage';
import AdminPage from './components/AdminPage';
import StarredPage from './components/StarredPage';
import HistoryPage from './components/HistoryPage';
import ArticlePage from './components/ArticlePage';
import InboxPage from './components/InboxPage';
import SettingsPage from './components/SettingsPage';
import EmailConfirmationPage from './components/EmailConfirmationPage';
import EmailSubscriptionsPage from './components/EmailSubscriptionsPage';
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
		path: '/admin',
		component: AdminPage
	},
	{
		path: '/articles/:sourceSlug/:articleSlug/:commentId?',
		component: ArticlePage
	},
	{
		path: '/email/confirm/:result',
		component: EmailConfirmationPage
	},
	{
		path: '/email/subscriptions',
		component: EmailSubscriptionsPage
	},
	{
		path: '/history',
		component: HistoryPage
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
	},
	{
		path: '/starred',
		component: StarredPage
	}
] as RouteProps[];