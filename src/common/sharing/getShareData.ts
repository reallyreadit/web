// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import UserArticle from '../models/UserArticle';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';

export default function getShareData(
	action: string,
	article: UserArticle,
	onCreateAbsoluteUrl: (path: string) => string
) {
	const [sourceSlug, articleSlug] = article.slug.split('_'),
		articleUrlParams = {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug,
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
		url: shareUrl,
	};
}
