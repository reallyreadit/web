import * as React from 'react';
import Article from '../api/models/Article';
import { Link } from 'react-router';
import * as className from 'classnames';
import readingParameters from '../../../common/readingParameters';

export default (article: Article) => {
	const slugParts = article.slug.split('_');
	return (
		<div className="article-details">
			<div className="top-row">
				<div className="title">
					<a href={article.url} target="_blank">{article.title}</a>
					{article.tags.length ? article.tags.map(tag => <span key={tag} className="tag">{tag}</span>) : null}
				</div>
				{article.description ? <span className="description">{article.description}</span> : null}
			</div>
			<span className="source">[{article.source}{article.section ? ' >> ' + article.section : ''}{article.authors.length ? ' - ' + article.authors.join(', ') : ''}]</span>
			<span> - </span>
			<span className="comment-count"><Link to={`/articles/${slugParts[0]}/${slugParts[1]}`}>{`${article.commentCount} comment${article.commentCount !== 1 ? 's' : ''}`}</Link></span>
			{article.percentComplete ? <span> - </span> : null}
			{article.percentComplete ?
				<span className={className('percent-complete', { unlocked: article.percentComplete >= readingParameters.articleUnlockThreshold })}>Percent Complete: {article.percentComplete}%</span> :
				null}
		</div>
	);
};