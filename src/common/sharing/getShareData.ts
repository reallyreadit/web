import UserArticle from '../models/UserArticle';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';

export default function getShareData(
	action: string,
	article: UserArticle,
	onCreateAbsoluteUrl: (path: string) => string
) {
	const
		[sourceSlug, articleSlug] = article.slug.split('_'),
		articleUrlParams = {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		},
		shareUrl = onCreateAbsoluteUrl(
			findRouteByKey(routes, ScreenKey.Read).createUrl(articleUrlParams)
		);
	return {
		action,
		email: {
			body: shareUrl,
			subject: `"${article.title}"`,
		},
		text: `"${article.title}"`,
		url: shareUrl
	};
}