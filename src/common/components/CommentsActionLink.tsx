import * as React from 'react';
import ActionLink from './ActionLink';
import UserArticle from '../models/UserArticle';
import routes from '../routing/routes';
import { findRouteByKey } from '../routing/Route';
import ScreenKey from '../routing/ScreenKey';

export default (props: {
	article: UserArticle,
	onClick?: (e: React.MouseEvent<HTMLElement>, href: string) => void
}) => {
	const
		[sourceSlug, articleSlug] = props.article.slug.split('_'),
		urlParams = {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		};
	return (
		<span className="comments-action-link_whpou5">
			<ActionLink
				href={findRouteByKey(routes, ScreenKey.Comments).createUrl(urlParams)}
				iconLeft="comments"
				onClick={props.onClick}
				text={`${props.article.commentCount} comment${props.article.commentCount !== 1 ? 's' : ''}`}
			/>
		</span>
	);
}