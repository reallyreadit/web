import * as React from 'react';
import ActionLink from './ActionLink';
import UserArticle from '../models/UserArticle';
import { getArticleUrlPath } from '../format';

export default (props: {
	article: UserArticle,
	onClick?: (e: React.MouseEvent<HTMLElement>, href: string) => void
}) => (
	<span className="comments-action-link">
		<ActionLink
			href={getArticleUrlPath(props.article.slug)}
			iconLeft="comments"
			onClick={props.onClick}
			text={`${props.article.commentCount} comment${props.article.commentCount !== 1 ? 's' : ''}`}
		/>
	</span>
);