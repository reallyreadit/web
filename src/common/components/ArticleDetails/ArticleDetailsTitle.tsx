import * as React from 'react';
import classNames from 'classnames';
import UserArticle from '../../models/UserArticle';
import Star from '../Star';
import { truncateText, formatTimestamp } from '../../format';

export default (props: {
	article: UserArticle,
	isStarring: boolean,
	onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void,
	onToggleStar: () => void,
	showStar: boolean
}) => (
	<div className="article-details-title">
		<div className={classNames('star-container', { hidden: !props.showStar })}>
			<Star
				starred={!!props.article.dateStarred}
				busy={props.isStarring}
				onClick={props.onToggleStar}
			/>
		</div>
		<div className="title-date">
			<a href={props.article.url} onClick={props.onClick}>
				{truncateText(props.article.title, 80)}
			</a>
			{props.article.datePublished ?
				<div className="date-published">
					{formatTimestamp(props.article.datePublished)}
				</div> :
				null}
		</div>
	</div>
);