import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import * as className from 'classnames';
import readingParameters from '../../../common/readingParameters';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import ReadReadinessDialog from './ReadReadinessDialog';
import CommentsActionLink from '../../../common/components/CommentsActionLink';
import Icon from '../../../common/components/Icon';
import PercentCompleteIndicator from '../../../common/components/PercentCompleteIndicator';

interface Props {
	article: UserArticle,
	showControls?: boolean,
	onDelete?: (article: UserArticle) => void
}
export default class ArticleDetails extends PureContextComponent<Props, {}> {
	private _slugParts: string[];
	private _checkReadReadiness = (e: React.MouseEvent<HTMLAnchorElement>) => {
		let reason: 'incompatibleBrowser' | 'extensionNotInstalled' | 'signedOut';
		if (!this.context.extension.isBrowserCompatible()) {
			reason = 'incompatibleBrowser';
		} else if (!this.context.extension.isInstalled()) {
			reason = 'extensionNotInstalled';
		} else if (!this.context.user.isSignedIn) {
			reason = 'signedOut';
		}
		if (reason) {
			e.preventDefault();
			this.context.page.openDialog(React.createElement(ReadReadinessDialog, { reason, articleUrl: (e.target as HTMLAnchorElement).href }));
		}
	};
	private _goToComments = () => this.context.router.history.push(`/articles/${this._slugParts[0]}/${this._slugParts[1]}`);
	private _deleteArticle = (e: React.MouseEvent<HTMLDivElement>) => this.props.onDelete(this.props.article);
	constructor(props: Props, context: Context) {
		super(props, context);
		this._slugParts = props.article.slug.split('_')
	}
	public render() {
		const article = this.props.article;
		return (
			<div className="article-details">
				<div className={className('content', { 'with-controls': this.props.showControls })}>
					<div className="top-row">
						<div className="title">
							<a href={article.url} onClick={this._checkReadReadiness}>{article.title}</a>
							<span className="word-count">({Math.round(article.wordCount / readingParameters.averageWordsPerMinute)} min. read)</span>
							{article.tags.length ? article.tags.map(tag => <span key={tag} className="tag">{tag}</span>) : null}
						</div>
						{article.description ? <span className="description">{article.description}</span> : null}
					</div>
					<span className="date-published">{article.datePublished ? article.datePublished.substring(0, 10) : ''}</span>
					{article.datePublished ? <span> - </span> : null}
					<span className="source">[{article.source}{article.section ? ' >> ' + article.section : ''}{article.authors.length ? ' - ' + article.authors.join(', ') : ''}]</span>
					<span> - </span>
					<CommentsActionLink commentCount={article.commentCount} onClick={this._goToComments} />
					{article.percentComplete ? <span> - </span> : null}
					{article.percentComplete ?
						<PercentCompleteIndicator percentComplete={article.percentComplete} /> : null}
				</div>
				{this.props.showControls ?
					<div className="controls" title="Delete" onClick={this._deleteArticle}>
						<Icon name="cancel" />
					</div> : null}
			</div>
		);
	}
}