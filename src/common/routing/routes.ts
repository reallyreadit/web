import { Route } from "./Route";
import DialogKey from "./DialogKey";
import ScreenKey from "./ScreenKey";
import UserAccountRole from "../models/UserAccountRole";

const routes: Route<DialogKey, ScreenKey>[] = [
	(function () {
		const pathRegExp = /^\/(?:(following)(?:\/(comment|post)\/([^/]+))?)?$/;
		return {
			analyticsName: 'Home',
			createUrl: params => {
				let url = '/';
				if (params && params['view'] && params['view'] === 'following') {
					url += 'following';
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
				}
				return url;
			},
			getPathParams: path => {
				const
					[, view, highlightedType, highlightedId] = path.match(pathRegExp),
					params: {
						view: 'trending' | 'following',
						highlightedType?: 'comment' | 'post',
						highlightedId?: string
					} = {
						view: view === 'following' ? view : 'trending'
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
			screenKey: ScreenKey.Home
		} as Route<DialogKey, ScreenKey>;
	})(),
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
		pathRegExp: /^\/password\/([^/]+)\/([^/]+)$/,
		screenKey: ScreenKey.Password
	},
	{
		analyticsName: 'PrivacyPolicy',
		createUrl: () => '/privacy-policy',
		pathRegExp: /^\/privacy-policy$/,
		screenKey: ScreenKey.PrivacyPolicy
	},
	...(function () {
		const
			pathRegExp = /^\/@([^/]+)$/,
			mainRoute = {
				analyticsName: 'Profile',
				createUrl: (params: { [key: string]: string }) => `/@${params['userName']}`,
				getPathParams: (path: string) => ({ userName: path.match(pathRegExp)[1] }),
				pathRegExp,
				screenKey: ScreenKey.Profile
			};
		return [
			mainRoute,
			{
				...mainRoute,
				dialogKey: DialogKey.Followers,
				queryStringKeys: ['followers', 'user']
			}
		] as Route<DialogKey, ScreenKey>[];
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