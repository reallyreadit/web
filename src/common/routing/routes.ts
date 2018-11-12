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
		createUrl: () => '/?create-account',
		dialogKey: DialogKey.CreateAccount,
		pathRegExp: /^\/$/,
		queryStringKeys: ['create-account'],
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
		createUrl: () => '/?sign-in',
		dialogKey: DialogKey.SignIn,
		pathRegExp: /^\/$/,
		queryStringKeys: ['sign-in'],
		screenKey: ScreenKey.Home
	},
	{
		authLevel: UserAccountRole.Admin,
		createUrl: () => '/admin',
		pathRegExp: /^\/admin$/,
		screenKey: ScreenKey.AdminPage
	},
	{
		createUrl: params => {
			let url = `/articles/${params['sourceSlug']}/${params['articleSlug']}`;
			if (params['commentId']) {
				url += `/${params['commentId']}`;
			}
			return url;
		},
		pathRegExp: /^\/articles\/([^/]+)\/([^/]+)(\/[^/]+)?$/,
		screenKey: ScreenKey.Comments
	},
	{
		createUrl: params => `/articles/${params['sourceSlug']}/${params['articleSlug']}?share`,
		dialogKey: DialogKey.ShareArticle,
		pathRegExp: /^\/articles\/([^/]+)\/([^/]+)$/,
		queryStringKeys: ['share'],
		screenKey: ScreenKey.Comments
	},
	{
		createUrl: params => `/email/confirm/${params['result']}`,
		pathRegExp: /^\/email\/confirm\/([^/]+)$/,
		screenKey: ScreenKey.EmailConfirmation
	},
	{
		createUrl: params => `/email/subscriptions?token=${params['token']}`,
		pathRegExp: /^\/email\/subscriptions$/,
		queryStringKeys: ['token'],
		screenKey: ScreenKey.EmailSubscriptions
	},
	{
		createUrl: () => '/history',
		pathRegExp: /^\/history$/,
		screenKey: ScreenKey.History
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/inbox',
		pathRegExp: /^\/inbox$/,
		screenKey: ScreenKey.Inbox
	},
	{
		createUrl: () => '/leaderboards',
		pathRegExp: /^\/leaderboards$/,
		screenKey: ScreenKey.Leaderboards
	},
	{
		createUrl: params => `/password/${params['action']}/${params['result']}`,
		pathRegExp: /^\/password\/([^/]+)\/([^/]+)$/,
		screenKey: ScreenKey.Password
	},
	{
		createUrl: () => '/pizza',
		pathRegExp: /^\/pizza$/,
		screenKey: ScreenKey.PizzaChallenge
	},
	{
		createUrl: () => '/privacy-policy',
		pathRegExp: /^\/privacy-policy$/,
		screenKey: ScreenKey.PrivacyPolicy
	},
	{
		authLevel: UserAccountRole.Regular,
		createUrl: () => '/settings',
		pathRegExp: /^\/settings$/,
		screenKey: ScreenKey.Settings
	},
	{
		createUrl: () => '/starred',
		pathRegExp: /^\/starred$/,
		screenKey: ScreenKey.Starred
	}
];
export default routes;