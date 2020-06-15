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
		createUrl: params => `/?reset-password&email=${params['email']}&token=${params['token']}`,
		dialogKey: DialogKey.ResetPassword,
		pathRegExp: /^\/$/,
		queryStringKeys: ['reset-password', 'email', 'token'],
		screenKey: ScreenKey.Home
	},
	{
		analyticsName: 'Admin',
		authLevel: UserAccountRole.Admin,
		createUrl: () => '/admin',
		pathRegExp: /^\/admin$/,
		screenKey: ScreenKey.Admin
	},
	{
		analyticsName: 'AotdHistory',
		createUrl: () => '/aotd/history',
		pathRegExp: /^\/aotd\/history$/,
		screenKey: ScreenKey.AotdHistory
	},
	{
		analyticsName: 'Blog',
		createUrl: () => '/blog',
		noIndex: () => true,
		pathRegExp: /^\/blog$/,
		screenKey: ScreenKey.Blog
	},
	(function () {
		const
			pathRegExp = /^\/comments\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/,
			getPathParams = (path: string) => {
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
			};
		return {
			analyticsName: 'Comments',
			createUrl: params => {
				let url = `/comments/${params['sourceSlug']}/${params['articleSlug']}`;
				if (params['commentId']) {
					url += `/${params['commentId']}`;
				}
				return url;
			},
			getPathParams,
			pathRegExp,
			screenKey: ScreenKey.Comments
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		analyticsName: 'EmailConfirmation',
		createUrl: params => `/email/confirm/${params['result']}`,
		noIndex: () => true,
		pathRegExp: /^\/email\/confirm\/([^/]+)$/,
		screenKey: ScreenKey.EmailConfirmation
	},
	{
		analyticsName: 'EmailSubscriptions',
		createUrl: params => `/email/subscriptions?token=${params['token']}`,
		noIndex: () => true,
		pathRegExp: /^\/email\/subscriptions$/,
		queryStringKeys: ['token'],
		screenKey: ScreenKey.EmailSubscriptions
	},
	{
		analyticsName: 'ExtensionRemoval',
		createUrl: () => `/extension/uninstall`,
		noIndex: () => true,
		pathRegExp: /^\/extension\/uninstall$/,
		screenKey: ScreenKey.ExtensionRemoval
	},
	{
		analyticsName: 'ExtensionRemoval',
		createUrl: params => `/extension/uninstall?installationId=${params['installationId']}`,
		noIndex: () => true,
		pathRegExp: /^\/extension\/uninstall$/,
		queryStringKeys: ['installationId'],
		screenKey: ScreenKey.ExtensionRemoval
	},
	{
		analyticsName: 'MyFeed',
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/feed',
		pathRegExp: /^\/feed$/,
		screenKey: ScreenKey.MyFeed
	},
	{
		analyticsName: 'Leaderboards',
		createUrl: () => '/leaderboards',
		pathRegExp: /^\/leaderboards$/,
		screenKey: ScreenKey.Leaderboards
	},
	(function () {
		const pathRegExp = /^\/notifications(?:\/([^/]+))?$/;
		return {
			analyticsName: 'Inbox',
			authLevel: UserAccountRole.Regular,
			createUrl: params => {
				let url = '/notifications';
				if (params && params['commentId']) {
					url += `/${params['commentId']}`;
				}
				return url;
			},
			getPathParams: path => {
				const [, commentId] = path.match(pathRegExp);
				if (commentId) {
					return { commentId };
				}
				return { };
			},
			pathRegExp,
			screenKey: ScreenKey.Inbox
		} as Route<DialogKey, ScreenKey>;
	})(),
	(function () {
		const pathRegExp = /^\/(starred|history)$/;
		return {
			analyticsName: 'MyReads',
			authLevel: UserAccountRole.Regular,
			createUrl: params => {
				if (
					params &&
					(
						params['view'] === 'starred' ||
						params['view'] === 'history'
					)
				) {
					return `/${params['view']}`;
				}
				return '/starred';
			},
			getPathParams: path => {
				const [, view] = path.match(pathRegExp);
				return {
					view: view === 'history' ? view : 'starred'
				};
			},
			pathRegExp,
			screenKey: ScreenKey.MyReads
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		analyticsName: 'PasswordReset',
		createUrl: params => `/password/${params['action']}/${params['result']}`,
		noIndex: () => true,
		pathRegExp: /^\/password\/([^/]+)\/([^/]+)$/,
		screenKey: ScreenKey.Password
	},
	{
		analyticsName: 'PrivacyPolicy',
		createUrl: () => '/terms',
		pathRegExp: /^\/terms$/,
		screenKey: ScreenKey.PrivacyPolicy
	},
	(function () {
		const pathRegExp = /^\/@([^/]+)(?:\/(comment|post)\/([^/]+))?$/;
		return {
			analyticsName: 'Profile',
			createUrl: (params: { [key: string]: string }) => {
				let url = `/@${params['userName']}`;
				if (
					params['highlightedType'] &&
					(
						params['highlightedType'] === 'comment' ||
						params['highlightedType'] === 'post'
					) &&
					params['highlightedId']
				) {
					url += `/${params['highlightedType']}/${params['highlightedId']}`;
				}
				return url;
			},
			getPathParams: (path: string) => {
				const
					[, userName, highlightedType, highlightedId] = path.match(pathRegExp),
					params: {
						userName: string,
						highlightedType?: 'comment' | 'post',
						highlightedId?: string
					} = {
						userName
					};
				if (highlightedType === 'comment' || highlightedType === 'post') {
					params.highlightedType = highlightedType;
				}
				if (highlightedId) {
					params.highlightedId = highlightedId;
				}
				return params;
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
			noIndex: () => true,
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
	},
	(function () {
		const pathRegExp = /^\/writers\/([^/]+)$/;
		return {
			analyticsName: 'Author',
			createUrl: params => `/writers/${params['slug']}`,
			getPathParams: path => ({
				slug: decodeURIComponent(path.match(pathRegExp)[1])
			}),
			pathRegExp,
			screenKey: ScreenKey.Author
		} as Route<DialogKey, ScreenKey>;
	})(),
];
export default routes;