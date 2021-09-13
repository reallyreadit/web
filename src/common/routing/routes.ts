import { Route } from "./Route";
import DialogKey from "./DialogKey";
import ScreenKey from "./ScreenKey";
import UserAccountRole from "../models/UserAccountRole";

const routes: Route<DialogKey, ScreenKey>[] = [
	{
		createUrl: () => '/',
		pathRegExp: /^\/$/,
		screenKey: ScreenKey.Home
	},
	{
		createUrl: params => `/?reset-password&email=${params['email']}&token=${params['token']}`,
		dialogKey: DialogKey.ResetPassword,
		pathRegExp: /^\/$/,
		queryStringKeys: ['reset-password', 'email', 'token'],
		screenKey: ScreenKey.Home
	},
	{
		authLevel: UserAccountRole.Admin,
		createUrl: () => '/admin',
		pathRegExp: /^\/admin$/,
		screenKey: ScreenKey.Admin
	},
	{
		createUrl: () => '/aotd/history',
		pathRegExp: /^\/aotd\/history$/,
		screenKey: ScreenKey.AotdHistory
	},
	{
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
		createUrl: () => '/download',
		pathRegExp: /^\/download$/,
		screenKey: ScreenKey.Download
	},
	{
		createUrl: params => `/email/confirm/${params['result']}`,
		noIndex: () => true,
		pathRegExp: /^\/email\/confirm\/([^/]+)$/,
		screenKey: ScreenKey.EmailConfirmation
	},
	{
		createUrl: params => `/email/subscriptions?token=${params['token']}`,
		noIndex: () => true,
		pathRegExp: /^\/email\/subscriptions$/,
		queryStringKeys: ['token'],
		screenKey: ScreenKey.EmailSubscriptions
	},
	{
		createUrl: () => `/extension/uninstall`,
		noIndex: () => true,
		pathRegExp: /^\/extension\/uninstall$/,
		screenKey: ScreenKey.ExtensionRemoval
	},
	{
		createUrl: params => `/extension/uninstall?installationId=${params['installationId']}`,
		noIndex: () => true,
		pathRegExp: /^\/extension\/uninstall$/,
		queryStringKeys: ['installationId'],
		screenKey: ScreenKey.ExtensionRemoval
	},
	{
		createUrl: () => '/faq',
		pathRegExp: /^\/faq$/,
		screenKey: ScreenKey.Faq
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/impact',
		pathRegExp: /^\/impact$/,
		screenKey: ScreenKey.MyImpact
	},
	{
		createUrl: () => '/leaderboards',
		pathRegExp: /^\/leaderboards$/,
		screenKey: ScreenKey.Leaderboards
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/notifications',
		pathRegExp: /^\/notifications$/,
		screenKey: ScreenKey.Notifications
	},
	{
		createUrl: () => '/mission',
		pathRegExp: /^\/mission$/,
		screenKey: ScreenKey.Mission
	},
	(function () {
		const pathRegExp = /^\/(starred|history)$/;
		return {
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
		createUrl: params => `/password/${params['action']}/${params['result']}`,
		noIndex: () => true,
		pathRegExp: /^\/password\/([^/]+)\/([^/]+)$/,
		screenKey: ScreenKey.Password
	},
	{
		createUrl: () => '/privacy',
		pathRegExp: /^\/privacy$/,
		screenKey: ScreenKey.PrivacyPolicy
	},
	(function () {
		const pathRegExp = /^\/@([^/]+)(?:\/(comment|post)\/([^/]+))?$/;
		return {
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
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/search',
		pathRegExp: /^\/search$/,
		screenKey: ScreenKey.Search
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/settings',
		pathRegExp: /^\/settings$/,
		screenKey: ScreenKey.Settings
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/stats',
		pathRegExp: /^\/stats$/,
		screenKey: ScreenKey.Stats
	},
	{
		createUrl: () => '/team',
		pathRegExp: /^\/team$/,
		screenKey: ScreenKey.Team
	},
	(function () {
		const pathRegExp = /^\/writers\/([^/]+)$/;
		return {
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

export function createArticleSlug(articlePathParams: { [key: string]: string }) {
	return articlePathParams['sourceSlug'] + '_' + articlePathParams['articleSlug'];
}