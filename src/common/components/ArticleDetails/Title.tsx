import * as React from 'react';
import * as className from 'classnames';
import UserArticle from '../../models/UserArticle';
import Star from '../../components/Star';

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
				{props.article.title.length > 80 ?
					props.article.title.substring(0, 80) + '...' :
					props.article.title}
			</a>
			{props.article.datePublished ?
				<div className="date-published">
					{
						parseInt(props.article.datePublished.substr(5, 2)) + '/' +
						parseInt(props.article.datePublished.substr(8, 2)) + '/' +
						props.article.datePublished.substr(2, 2)
					}
				</div> :
				null}
		</div>
	</div>
);