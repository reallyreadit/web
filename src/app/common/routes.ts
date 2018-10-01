import { Route } from "./Route";
import DialogKey from "./DialogKey";
import ScreenKey from "./ScreenKey";

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
		createUrl: params => `/articles/${params['sourceSlug']}/${params['articleSlug']}`,
		pathRegExp: /^\/articles\/[^/]+\/[^/]+$/,
		screenKey: ScreenKey.ArticleDetails
	},
	{
		createUrl: params => `/articles/${params['sourceSlug']}/${params['articleSlug']}?share`,
		dialogKey: DialogKey.ShareArticle,
		pathRegExp: /^\/articles\/[^/]+\/[^/]+$/,
		queryStringKeys: ['share'],
		screenKey: ScreenKey.ArticleDetails
	},
	{
		createUrl: () => '/starred',
		pathRegExp: /^\/starred$/,
		screenKey: ScreenKey.Starred
	}
];
export default routes;