import { Route } from "./Route";
import DialogKey from "./DialogKey";
import ScreenKey from "./ScreenKey";
import UserAccountRole from "../models/UserAccountRole";

const routes: Route<DialogKey, ScreenKey>[] = [
	{
		analyticsName: 'Home',
		createUrl: () => '/',
		pathRegExp: /^\/$/,
		screenKey: ScreenKey.Home
	},
	{
		analyticsName: 'Home',
		createUrl: () => '/?create-account',
		dialogKey: DialogKey.CreateAccount,
		pathRegExp: /^\/$/,
		queryStringKeys: ['create-account'],
		screenKey: ScreenKey.Home
	},
	{
		analyticsName: 'Home',
		createUrl: params => `/?reset-password&email=${params['email']}&token=${params['token']}`,
		dialogKey: DialogKey.ResetPassword,
		pathRegExp: /^\/$/,
		queryStringKeys: ['reset-password', 'email', 'token'],
		screenKey: ScreenKey.Home
	},
	{
		analyticsName: 'Home',
		createUrl: () => '/?sign-in',
		dialogKey: DialogKey.SignIn,
		pathRegExp: /^\/$/,
		queryStringKeys: ['sign-in'],
		screenKey: ScreenKey.Home
	},
	{
		analyticsName: 'Admin',
		authLevel: UserAccountRole.Admin,
		createUrl: () => '/admin',
		pathRegExp: /^\/admin$/,
		screenKey: ScreenKey.Admin
	},
	(function () {
		const pathRegExp = /^\/comments\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/;
		return {
			analyticsName: 'Comments',
			createUrl: params => {
				let url = `/comments/${params['sourceSlug']}/${params['articleSlug']}`;
				if (params['commentId']) {
					url += `/${params['commentId']}`;
				}
				return url;
			},
			getPathParams: path => {
				const [, sourceSlug, articleSlug, commentId] = path.match(pathRegExp);
				let result = { articleSlug, sourceSlug } as {
					articleSlug: string,
					commentId?: string,
					sourceSlug: string
				};
				if (commentId != null) {
					result.commentId = commentId;
				}
				return result;
			},
			pathRegExp,
			screenKey: ScreenKey.Comments
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		analyticsName: 'EmailConfirmation',
		createUrl: params => `/email/confirm/${params['result']}`,
		pathRegExp: /^\/email\/confirm\/([^/]+)$/,
		screenKey: ScreenKey.EmailConfirmation
	},
	{
		analyticsName: 'EmailSubscriptions',
		createUrl: params => `/email/subscriptions?token=${params['token']}`,
		pathRegExp: /^\/email\/subscriptions$/,
		queryStringKeys: ['token'],
		screenKey: ScreenKey.EmailSubscriptions
	},
	{
		analyticsName: 'History',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/history',
		pathRegExp: /^\/history$/,
		screenKey: ScreenKey.History
	},
	{
		analyticsName: 'Inbox',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/inbox',
		pathRegExp: /^\/inbox$/,
		screenKey: ScreenKey.Inbox
	},
	{
		analyticsName: 'Leaderboards',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/leaderboards',
		pathRegExp: /^\/leaderboards$/,
		screenKey: ScreenKey.Leaderboards
	},
	{
		analyticsName: 'PasswordReset',
		createUrl: params => `/password/${params['action']}/${params['result']}`,
		pathRegExp: /^\/password\/([^/]+)\/([^/]+)$/,
		screenKey: ScreenKey.Password
	},
	{
		analyticsName: 'PrivacyPolicy',
		createUrl: () => '/privacy-policy',
		pathRegExp: /^\/privacy-policy$/,
		screenKey: ScreenKey.PrivacyPolicy
	},
	(function () {
		const pathRegExp = /^\/read\/([^/]+)\/([^/]+)$/;
		return {
			analyticsName: 'Read',
			createUrl: params => `/read/${params['sourceSlug']}/${params['articleSlug']}`,
			getPathParams: path => {
				const [, sourceSlug, articleSlug] = path.match(pathRegExp);
				return { articleSlug, sourceSlug };
			},
			pathRegExp,
			screenKey: ScreenKey.Read
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		analyticsName: 'Settings',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/settings',
		pathRegExp: /^\/settings$/,
		screenKey: ScreenKey.Settings
	},
	{
		analyticsName: 'Starred',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/starred',
		pathRegExp: /^\/starred$/,
		screenKey: ScreenKey.Starred
	},
	{
		analyticsName: 'Stats',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/stats',
		pathRegExp: /^\/stats$/,
		screenKey: ScreenKey.Stats
	}
];
export default routes;