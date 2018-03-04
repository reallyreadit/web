import * as React from 'react';
import * as className from 'classnames';
import UserArticle from '../../models/UserArticle';
import Star from '../../components/Star';
import { truncateText, formatTimestamp } from '../../format';

export default (props: {
	article: UserArticle,
	showStar: boolean,
	isStarring: boolean,
	onStar: () => void,
	onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) => (
	<div className="title">
		<div className={className('star-container', { hidden: !props.showStar })}>
			<Star
				starred={!!props.article.dateStarred}
				busy={props.isStarring}
				onClick={props.onStar}
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