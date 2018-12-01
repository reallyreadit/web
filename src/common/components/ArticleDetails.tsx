import * as React from 'react';
import UserArticle from '../models/UserArticle';
import { formatTimestamp } from '../format';
import Star from './Star';
import readingParameters from '../readingParameters';
import SpeechBubble from './Logo/SpeechBubble';
import Icon from './Icon';
import ScreenKey from '../routing/ScreenKey';
import routes from '../routing/routes';
import { findRouteByKey } from '../routing/Route';

interface Props {
	article: UserArticle,
	isUserSignedIn: boolean,
	onDelete?: (article: UserArticle) => void,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (article: UserArticle) => void,
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	showDeleteControl?: boolean
}
export default class extends React.PureComponent<Props, { isStarring: boolean }> {
	public static defaultProps = {
		onDelete: () => {},
		showDeleteControl: false
	};
	private readonly _read = (e: React.MouseEvent<HTMLAnchorElement>) => {
		this.props.onRead(this.props.article, e);
	};
	private readonly _share = () => {
		if (this.props.article.isRead) {
			this.props.onShare(this.props.article);
		}
	};
	private readonly _toggleStar = () => {
		this.setState({ isStarring: true });
		this.props
			.onToggleStar(this.props.article)
			.then(() => { this.setState({ isStarring: false }); })
			.catch(() => { this.setState({ isStarring: false }); })
	};
	private readonly _viewComments = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		this.props.onViewComments(this.props.article, e as React.MouseEvent<HTMLAnchorElement>);
	};
	constructor(props: Props) {
		super(props);
		this.state = { isStarring: false };
	}
	public render() {
		const
			[sourceSlug, articleSlug] = this.props.article.slug.split('_'),
			urlParams = {
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug
			},
			commentsLinkHref = findRouteByKey(routes, ScreenKey.Comments).createUrl(urlParams),
			star = (
				<div className="star-container">
					<Star
						starred={!!this.props.article.dateStarred}
						busy={this.state.isStarring}
						onClick={this._toggleStar}
					/>
				</div>
			),
			titleLink = (
				<a
					className="title-link"
					href={this.props.article.url}
					onClick={this._read}
				>
					{this.props.article.title}
				</a>
			);
		return (
			<div className="article-details">
				<div className="small-title">
					{star}
					{titleLink}
				</div>
				<div className="columns">
					<div className="stats">
						<div className="stat reads">
							<div className="count">
								{this.props.article.readCount}
							</div>
							<label>{this.props.article.readCount === 1 ? 'read' : 'reads'}</label>
						</div>
						<a
							className="stat comments"
							href={commentsLinkHref}
							onClick={this._viewComments}
						>
							<div className="count">
								{this.props.article.commentCount}
							</div>
							<label>{this.props.article.commentCount === 1 ? 'comment' : 'comments'}</label>
						</a>
					</div>
					{star}
					<div className="article">
						{titleLink}
						<div className="meta">
							<span className="publisher">
								{this.props.article.source}
							</span>
							{this.props.article.authors.length || this.props.article.datePublished ?
								<span> · </span> :
								null}
							{this.props.article.authors.length ?
								<span className="author">
									{this.props.article.authors.join(', ')}
								</span> :
								null}
							{this.props.article.authors.length && this.props.article.datePublished ?
								<span> · </span> :
								null}
							{this.props.article.datePublished ?
								<span className="date">
									{formatTimestamp(this.props.article.datePublished)}
								</span> :
								null}
							{this.props.article.isRead ?
								<Icon
									name="share"
									title="Share Article"
									onClick={this._share}
								/> :
								null}
						</div>
					</div>
					<div className="small-stats-article">
						<div className="meta">
							<div className="publisher">
								{this.props.article.source}
							</div>
							<div className="author-date">
								{this.props.article.authors.length ?
									<span className="author">
										{this.props.article.authors.join(', ')}
									</span> :
									null}
								{this.props.article.authors.length && this.props.article.datePublished ?
									<span className="spacer">·</span> :
									null}
								{this.props.article.datePublished ?
									<span className="date">
										{formatTimestamp(this.props.article.datePublished)}
									</span> :
									null}
							</div>
						</div>
						<div className="stats">
							<div className="stat reads">
								{this.props.article.readCount}
								{this.props.article.readCount === 1 ? ' read' : ' reads'}
							</div>
							<a
								className="stat comments"
								href={commentsLinkHref}
								onClick={this._viewComments}
							>
								{this.props.article.commentCount}
								{this.props.article.commentCount === 1 ? ' comment' : ' comments'}
							</a>
							{this.props.article.isRead ?
								<Icon
									name="share"
									title="Share Article"
									onClick={this._share}
								/> :
								null}
						</div>
					</div>
					<div className="bubble">
						<div className="container">
							<SpeechBubble
								percentComplete={this.props.article.percentComplete}
								isRead={this.props.article.isRead}
								uuid={`article-details-speech-bubble-${this.props.article.id}`}
							/>
							<div className="length">
								{Math.max(1, Math.floor(this.props.article.wordCount / readingParameters.averageWordsPerMinute))} min read
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}