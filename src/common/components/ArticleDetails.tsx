import * as React from 'react';
import Article from '../api/models/Article';
import { Link } from 'react-router';

export default (article: Article) => {
	const slugParts = article.slug.split('_');
	return (
		<div className="article-details">
			<span className="title"><Link to={`/articles/${slugParts[0]}/${slugParts[1]}`}>{article.title}</Link></span><br />
			<span className="source">[{article.source}{article.author ? ` - ${article.author}` : ''}]</span>
			<span> - </span>
			<span className="comment-count">{`${article.commentCount} comment${article.commentCount !== 1 ? 's' : ''}`}</span>
			{article.percentComplete ? <span> - </span> : null}
			{article.percentComplete ? <span className="percent-complete">Percent Complete: {article.percentComplete}%</span> : null}
		</div>
	);
};