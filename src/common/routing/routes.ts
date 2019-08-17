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
		analyticsName: 'ExtensionRemoval',
		createUrl: () => `/extension/uninstall`,
		pathRegExp: /^\/extension\/uninstall$/,
		screenKey: ScreenKey.ExtensionRemoval
	},
	{
		analyticsName: 'ExtensionRemoval',
		createUrl: params => `/extension/uninstall?installationId=${params['installationId']}`,
		pathRegExp: /^\/extension\/uninstall$/,
		queryStringKeys: ['installationId'],
		screenKey: ScreenKey.ExtensionRemoval
	},
	{
		analyticsName: 'Leaderboards',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/leaderboards',
		pathRegExp: /^\/leaderboards$/,
		screenKey: ScreenKey.Leaderboards
	},
	{
		analyticsName: 'MyReads',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/reads',
		pathRegExp: /^\/reads$/,
		screenKey: ScreenKey.MyReads
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
		const pathRegExp = /^\/@([^/]+)$/;
		return {
			analyticsName: 'Profile',
			createUrl: params => `/@${params['userName']}`,
			getPathParams: path => {
				return {
					userName: path.match(pathRegExp)[1]
				};
			},
			pathRegExp,
			screenKey: ScreenKey.Profile
		} as Route<DialogKey, ScreenKey>;
	})(),
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
		analyticsName: 'Stats',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/stats',
		pathRegExp: /^\/stats$/,
		screenKey: ScreenKey.Stats
	}
];
export default routes;