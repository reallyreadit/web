// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { Route } from './Route';
import DialogKey from './DialogKey';
import ScreenKey from './ScreenKey';
import UserAccountRole from '../models/UserAccountRole';
import { authServiceTokenQueryStringKey, authenticateQueryStringKey, extensionInstalledQueryStringKey } from './queryString';

const routes: Route<DialogKey, ScreenKey>[] = [
	{
		createUrl: () => '/',
		pathRegExp: /^\/$/,
		screenKey: ScreenKey.Home,
	},
	{
		createUrl: () => '/about',
		pathRegExp: /^\/about$/,
		screenKey: ScreenKey.About,
	},
	{
		createUrl: (params) =>
			`/?reset-password&email=${params['email']}&token=${params['token']}`,
		dialogKey: DialogKey.ResetPassword,
		pathRegExp: /^\/$/,
		queryStringKeys: ['reset-password', 'email', 'token'],
		screenKey: ScreenKey.Home,
	},
	{
		createUrl: (params) =>
			`/?${authServiceTokenQueryStringKey}=${params[authServiceTokenQueryStringKey]}`,
		dialogKey: DialogKey.CreateAuthServiceAccount,
		pathRegExp: /^\/$/,
		queryStringKeys: [authServiceTokenQueryStringKey],
		screenKey: ScreenKey.Home,
	},
	{
		createUrl: (params) =>
			`/?${authenticateQueryStringKey}=${params[authenticateQueryStringKey]}`,
		dialogKey: DialogKey.Authenticate,
		pathRegExp: /^\/$/,
		queryStringKeys: [authenticateQueryStringKey],
		screenKey: ScreenKey.Home,
	},
	{
		createUrl: () =>
			`/?${extensionInstalledQueryStringKey}`,
		dialogKey: DialogKey.ExtensionInstalled,
		pathRegExp: /^\/$/,
		queryStringKeys: [extensionInstalledQueryStringKey],
		screenKey: ScreenKey.Home,
	},
	{
		authLevel: UserAccountRole.Admin,
		createUrl: () => '/admin',
		pathRegExp: /^\/admin$/,
		screenKey: ScreenKey.Admin,
	},
	{
		createUrl: () => '/aotd/history',
		pathRegExp: /^\/aotd\/history$/,
		screenKey: ScreenKey.AotdHistory,
	},
	{
		createUrl: () => '/top-articles-of-all-time',
		pathRegExp: /^\/top-articles-of-all-time$/,
		screenKey: ScreenKey.BestEver,
	},
	{
		createUrl: () => '/blog',
		noIndex: () => true,
		pathRegExp: /^\/blog$/,
		screenKey: ScreenKey.Blog,
	},
	(function () {
		const pathRegExp = /^\/comments\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/,
			getPathParams = (path: string) => {
				const [, sourceSlug, articleSlug, commentId] = path.match(pathRegExp);
				let result = { articleSlug, sourceSlug } as {
					articleSlug: string;
					commentId?: string;
					sourceSlug: string;
				};
				if (commentId != null) {
					result.commentId = commentId;
				}
				return result;
			};
		return {
			createUrl: (params) => {
				let url = `/comments/${params['sourceSlug']}/${params['articleSlug']}`;
				if (params['commentId']) {
					url += `/${params['commentId']}`;
				}
				return url;
			},
			getPathParams,
			pathRegExp,
			screenKey: ScreenKey.Comments,
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		createUrl: () => '/contenders',
		pathRegExp: /^\/contenders$/,
		screenKey: ScreenKey.Contenders,
	},
	{
		createUrl: (params) => `/email/confirm/${params['result']}`,
		noIndex: () => true,
		pathRegExp: /^\/email\/confirm\/([^/]+)$/,
		screenKey: ScreenKey.EmailConfirmation,
	},
	{
		createUrl: (params) => `/email/subscriptions?token=${params['token']}`,
		noIndex: () => true,
		pathRegExp: /^\/email\/subscriptions$/,
		queryStringKeys: ['token'],
		screenKey: ScreenKey.EmailSubscriptions,
	},
	{
		createUrl: () => `/extension/uninstall`,
		noIndex: () => true,
		pathRegExp: /^\/extension\/uninstall$/,
		screenKey: ScreenKey.ExtensionRemoval,
	},
	{
		createUrl: (params) =>
			`/extension/uninstall?installationId=${params['installationId']}`,
		noIndex: () => true,
		pathRegExp: /^\/extension\/uninstall$/,
		queryStringKeys: ['installationId'],
		screenKey: ScreenKey.ExtensionRemoval,
	},
	{
		createUrl: () => '/faq',
		pathRegExp: /^\/faq$/,
		screenKey: ScreenKey.Faq,
	},
	{
		createUrl: () => '/my-feed',
		pathRegExp: /^\/my-feed$/,
		screenKey: ScreenKey.MyFeed,
	},
	// {
	// 	createUrl: () => '/leaderboards',
	// 	pathRegExp: /^\/leaderboards$/,
	// 	screenKey: ScreenKey.Leaderboards
	// },
	(function () {
		const pathRegExp = /^\/leaderboards\/?(writers|readers)?$/;
		return {
			createUrl: (params) => {
				if (
					params &&
					(params['view'] === 'writers' || params['view'] === 'readers')
				) {
					return `/leaderboards/${params['view']}`;
				}
				return '/leaderboards/writers';
			},
			getPathParams: (path) => {
				const [, view] = path.match(pathRegExp);
				return {
					view: view === 'readers' ? view : 'writers',
				};
			},
			pathRegExp,
			screenKey: ScreenKey.Leaderboards,
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/notifications',
		pathRegExp: /^\/notifications$/,
		screenKey: ScreenKey.Notifications,
	},
	(function () {
		const pathRegExp = /^\/(starred|history)$/;
		return {
			createUrl: (params) => {
				if (
					params &&
					(params['view'] === 'starred' || params['view'] === 'history')
				) {
					return `/${params['view']}`;
				}
				return '/starred';
			},
			getPathParams: (path) => {
				const [, view] = path.match(pathRegExp);
				return {
					view: view === 'history' ? view : 'starred',
				};
			},
			pathRegExp,
			screenKey: ScreenKey.MyReads,
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		createUrl: (params) => `/password/${params['action']}/${params['result']}`,
		noIndex: () => true,
		pathRegExp: /^\/password\/([^/]+)\/([^/]+)$/,
		screenKey: ScreenKey.Password,
	},
	{
		createUrl: () => '/privacy',
		pathRegExp: /^\/privacy$/,
		screenKey: ScreenKey.PrivacyPolicy,
	},
	(function () {
		const pathRegExp = /^\/@([^/]+)(?:\/(comment|post)\/([^/]+))?$/;
		return {
			createUrl: (params: { [key: string]: string }) => {
				let url = `/@${params['userName']}`;
				if (
					params['highlightedType'] &&
					(params['highlightedType'] === 'comment' ||
						params['highlightedType'] === 'post') &&
					params['highlightedId']
				) {
					url += `/${params['highlightedType']}/${params['highlightedId']}`;
				}
				return url;
			},
			getPathParams: (path: string) => {
				const [, userName, highlightedType, highlightedId] =
						path.match(pathRegExp),
					params: {
						userName: string;
						highlightedType?: 'comment' | 'post';
						highlightedId?: string;
					} = {
						userName,
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
			screenKey: ScreenKey.Profile,
		} as Route<DialogKey, ScreenKey>;
	})(),
	(function () {
		const pathRegExp = /^\/read\/([^/]+)\/([^/]+)$/;
		return {
			createUrl: (params) =>
				`/read/${params['sourceSlug']}/${params['articleSlug']}`,
			getPathParams: (path) => {
				const [, sourceSlug, articleSlug] = path.match(pathRegExp);
				return { articleSlug, sourceSlug };
			},
			noIndex: () => true,
			pathRegExp,
			screenKey: ScreenKey.Read,
		} as Route<DialogKey, ScreenKey>;
	})(),
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/search',
		pathRegExp: /^\/search$/,
		screenKey: ScreenKey.Search,
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/settings',
		pathRegExp: /^\/settings$/,
		screenKey: ScreenKey.Settings,
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/stats',
		pathRegExp: /^\/stats$/,
		screenKey: ScreenKey.Stats,
	},
	(function () {
		const pathRegExp = /^\/writers\/([^/]+)$/;
		return {
			createUrl: (params) => `/writers/${params['slug']}`,
			getPathParams: (path) => ({
				slug: decodeURIComponent(path.match(pathRegExp)[1]),
			}),
			pathRegExp,
			screenKey: ScreenKey.Author,
		} as Route<DialogKey, ScreenKey>;
	})(),
];
export default routes;

export function createArticleSlug(articlePathParams: {
	[key: string]: string;
}) {
	return (
		articlePathParams['sourceSlug'] + '_' + articlePathParams['articleSlug']
	);
}
