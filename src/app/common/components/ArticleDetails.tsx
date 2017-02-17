import * as React from 'react';
import Article from '../api/models/Article';
import { Link } from 'react-router';
import * as className from 'classnames';
import readingParameters from '../../../common/readingParameters';

export default (article: Article) => {
	const slugParts = article.slug.split('_');
	return (
		<div className="article-details">
			<span className="title"><a href={article.url} target="_blank">{article.title}</a></span><br />
			<span className="source">[{article.source}{article.author ? ` - ${article.author}` : ''}]</span>
			<span> - </span>
			<span className="comment-count"><Link to={`/articles/${slugParts[0]}/${slugParts[1]}`}>{`${article.commentCount} comment${article.commentCount !== 1 ? 's' : ''}`}</Link></span>
			{article.percentComplete ? <span> - </span> : null}
			{article.percentComplete ?
				<span className={className('percent-complete', { unlocked: article.percentComplete >= readingParameters.articleUnlockThreshold })}>Percent Complete: {article.percentComplete}%</span> :
				null}
		</div>
	);
};