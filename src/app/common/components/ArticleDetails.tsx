import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import * as className from 'classnames';
import PureContextComponent from '../PureContextComponent';
import Context from '../Context';
import ReadReadinessDialog from './ReadReadinessDialog';
import CommentsActionLink from '../../../common/components/CommentsActionLink';
import SpeechBubble from './Logo/SpeechBubble';
import DoubleRPathGroup from './Logo/DoubleRPathGroup';
import Title from './ArticleDetails/Title';
import Icon from '../../../common/components/Icon';
import readingParameters from '../../../common/readingParameters';

interface Props {
	article: UserArticle,
	showStarControl: boolean,
	showDeleteControl?: boolean,
	onChange: (article: UserArticle) => void,
	onDelete?: (article: UserArticle) => void
}
export default class ArticleDetails extends PureContextComponent<Props, { isStarring: boolean }> {
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
	private _toggleStar = () => {
		this.setState({ isStarring: true });
		(this.props.article.dateStarred ?
			this.context.api.unstarArticle(this.props.article.id) :
			this.context.api.starArticle(this.props.article.id))
				.then(() => {
					this.setState({ isStarring: false });
					this.props.onChange({
						...this.props.article,
						dateStarred: this.props.article.dateStarred ? null : new Date().toISOString()
					});
				});
	};
	private _delete = () => this.props.onDelete(this.props.article);
	constructor(props: Props, context: Context) {
		super(props, context);
		this.state = { isStarring: false };
		this.setSlugParts(props.article.slug);
	}
	private setSlugParts(slug: string) {
		this._slugParts = slug.split('_');
	}
	public componentWillReceiveProps(nextProps: Props) {
		this.setSlugParts(nextProps.article.slug);
	}
	public render() {
		const article = this.props.article;
		return (
			<div className="article-details">
				<div className="content">
					<Title
						article={article}
						showStar={this.props.showStarControl}
						isStarring={this.state.isStarring}
						onStar={this._toggleStar}
						onClick={this._checkReadReadiness}
					/>
					{article.tags.length ?
						<div className="tags">
							{article.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
						</div> :
						null}
					<div className="columns">
						<div className="left">
							<div className="length">
								{Math.round(article.wordCount / readingParameters.averageWordsPerMinute)} min
							</div>
							<div className="speech-bubble-container">
								<SpeechBubble
									percentComplete={article.percentComplete}
									isRead={article.isRead}
									uuid={`article-details-${article.id}`}
								>
									{!this.props.showStarControl ?
										<DoubleRPathGroup /> :
										null}
								</SpeechBubble>
								{this.props.showStarControl ?
									<div className="percent-complete-label">{article.percentComplete.toFixed() + '%'}</div> :
									null}
							</div>
						</div>
						<div className="right">
							<Title
								article={article}
								showStar={this.props.showStarControl}
								isStarring={this.state.isStarring}
								onStar={this._toggleStar}
								onClick={this._checkReadReadiness}
							/>
							{article.description ?
								<div className="description">{article.description}</div> :
								null}
							<div className="s-r-c">
								<div className="source">
									{
										article.source +
										(article.section ? ' >> ' + article.section : '') +
										(article.authors.length ? ' - ' + article.authors.join(', ') : '')
									}
								</div>
								<span className="reads">
									<Icon name="book" />
									{article.readCount + ' ' + (article.readCount === 1 ? 'read' : 'reads')}
								</span>
								<CommentsActionLink commentCount={article.commentCount} onClick={this._goToComments} />
								{article.aotdTimestamp ?
									<Icon className="aotd" name="trophy" /> :
									null}
							</div>
						</div>
					</div>
				</div>
				<div className={className('controls', { hidden: !this.props.showDeleteControl })}>
					<div className="delete-control" title="Delete Article">
						<Icon name="cancel" onClick={this._delete} />
					</div>
				</div>
			</div>
		);
	}
}