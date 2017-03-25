import * as React from 'react';
import Article from '../api/models/Article';
import { Link } from 'react-router';
import * as className from 'classnames';
import readingParameters from '../../../common/readingParameters';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import ReadReadinessDialog from './ReadReadinessDialog';

interface Props {
	article: Article,
	showControls?: boolean,
	onDelete?: (article: Article) => void
}
export default class ArticleDetails extends PureContextComponent<Props, {}> {
	private slugParts: string[];
	private _checkReadReadiness = (e: React.MouseEvent<HTMLAnchorElement>) => {
		let reason: 'incompatibleBrowser' | 'extensionNotInstalled' | 'signedOut';
		if (!this.context.extension.isBrowserCompatible()) {
			reason = 'incompatibleBrowser';
		} else if (!this.context.extension.isInstalled()) {
			reason = 'extensionNotInstalled';
		} else if (!this.context.user.isSignedIn()) {
			reason = 'signedOut';
		}
		if (reason) {
			e.preventDefault();
			this.context.dialog.show(React.createElement(ReadReadinessDialog, { reason, articleUrl: (e.target as HTMLAnchorElement).href }));
		}
	};
	private _deleteArticle = (e: React.MouseEvent<HTMLDivElement>) => this.props.onDelete(this.props.article);
	constructor(props: Props, context: Context) {
		super(props, context);
		this.slugParts = props.article.slug.split('_')
	}
	public render() {
		const article = this.props.article;
		return (
			<div className="article-details">
				<div className={className('content', { 'with-controls': this.props.showControls })}>
					<div className="top-row">
						<div className="title">
							<a href={article.url} target="_blank" onClick={this._checkReadReadiness}>{article.title}</a>
							<span className="word-count">({article.pageCount} {article.pageCount === 1 ? 'page' : 'pages'}/{article.wordCount} words)</span>
							{article.tags.length ? article.tags.map(tag => <span key={tag} className="tag">{tag}</span>) : null}
						</div>
						{article.description ? <span className="description">{article.description}</span> : null}
					</div>
					<span className="date-published">{article.datePublished ? article.datePublished.substring(0, 10) : ''}</span>
					{article.datePublished ? <span> - </span> : null}
					<span className="source">[{article.source}{article.section ? ' >> ' + article.section : ''}{article.authors.length ? ' - ' + article.authors.join(', ') : ''}]</span>
					<span> - </span>
					<span className="comment-count"><Link to={`/articles/${this.slugParts[0]}/${this.slugParts[1]}`}>{`${article.commentCount} comment${article.commentCount !== 1 ? 's' : ''}`}</Link></span>
					{article.percentComplete ? <span> - </span> : null}
					{article.percentComplete ?
						<span className={className('percent-complete', { unlocked: article.percentComplete >= readingParameters.articleUnlockThreshold })}>Percent Complete: {article.percentComplete}%</span> : null}
				</div>
				{this.props.showControls ?
					<div className="controls" title="Delete" onClick={this._deleteArticle}>
						<svg className="icon"><use xlinkHref="#icon-x"></use></svg>
					</div> : null}
			</div>
		);
	}
}