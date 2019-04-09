import * as React from 'react';
import UserArticle from '../models/UserArticle';
import { formatTimestamp, formatCountable } from '../format';
import Star from './Star';
import ScreenKey from '../routing/ScreenKey';
import routes from '../routing/routes';
import { findRouteByKey } from '../routing/Route';
import ShareControl, { MenuPosition } from './ShareControl';
import Icon from './Icon';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import classNames from 'classnames';
import { calculateEstimatedReadTime } from '../calculate';

interface Props {
	article: UserArticle,
	isUserSignedIn: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	useAbsoluteUrls?: boolean
}
export default class extends React.PureComponent<Props, { isStarring: boolean }> {
	private readonly _getShareData = () => {
		const
			[sourceSlug, articleSlug] = this.props.article.slug.split('_'),
			articleUrlParams = {
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug
			},
			shareUrl = this.props.onCreateAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Read).createUrl(articleUrlParams)
			);
		return {
			email: {
				body: shareUrl,
				subject: `"${this.props.article.title}"`,
			},
			text: `"${this.props.article.title}"`,
			url: shareUrl
		};
	};
	private readonly _read = (e: React.MouseEvent<HTMLAnchorElement>) => {
		this.props.onRead(this.props.article, e);
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
		this.props.onViewComments(this.props.article);
	};
	constructor(props: Props) {
		super(props);
		this.state = { isStarring: false };
	}
	public render() {
		const
			[sourceSlug, articleSlug] = this.props.article.slug.split('_'),
			articleUrlParams = {
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug
			},
			titleLink = (
				<a
					className="title-link"
					href={this.props.article.url}
					onClick={this._read}
				>
					{this.props.article.title}
				</a>
			),
			estimatedReadTime = calculateEstimatedReadTime(this.props.article.wordCount) + ' min',
			averageRatingScore = this.props.article.averageRatingScore != null && this.props.article.averageRatingScore < 10 ?
				this.props.article.averageRatingScore.toFixed(1) :
				this.props.article.averageRatingScore;
		// publisher metadata
		const publisherMetadata = [this.props.article.source];
		if (this.props.article.authors.length) {
			publisherMetadata.push(
				this.props.article.authors.join(', ')
			);
		}
		if (this.props.article.datePublished) {
			publisherMetadata.push(
				formatTimestamp(this.props.article.datePublished)
			);
		}
		publisherMetadata.push(estimatedReadTime);
		// comments link
		let commentsLinkHref = findRouteByKey(routes, ScreenKey.Comments)
			.createUrl(articleUrlParams);
		if (this.props.useAbsoluteUrls) {
			commentsLinkHref = this.props.onCreateAbsoluteUrl(commentsLinkHref);
		}
		return (
			<div className="article-details_d2vnmv">
				<div className="actions">
					<div className="star-container">
						<Star
							starred={!!this.props.article.dateStarred}
							busy={this.state.isStarring}
							onClick={this._toggleStar}
						/>
					</div>
					<ShareControl
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onGetData={this._getShareData}
						onShare={this.props.onShare}
						menuPosition={MenuPosition.MiddleRight}
					>
						<Icon
							className="icon"
							name="share"
						/>
					</ShareControl>
				</div>
				<div className="info">
					<div className="small-title">
						{titleLink}
					</div>
					<div className="columns">
						<div className="article">
							{titleLink}
							<div className="meta">
								{publisherMetadata.join(' | ')}
							</div>
							<div className="stats">
								<div className="stat reads">
									<span className="count">{this.props.article.readCount}</span> {formatCountable(this.props.article.readCount, 'read')}
								</div>
								<a
									className="stat comments"
									href={commentsLinkHref}
									onClick={this._viewComments}
								>
									<span className="count">{this.props.article.commentCount}</span> {formatCountable(this.props.article.commentCount, 'comment')}
								</a>
								{averageRatingScore != null ?
									<div className="stat rating">
										<span>{averageRatingScore}</span>
									</div> :
									null}
							</div>
						</div>
						<div className="small-stats-article">
							<div className="meta">
								<div className="publisher">
									{this.props.article.source}
								</div>
								<div className="author-date-length">
									{this.props.article.authors.length ?
										<span className="author">
											{this.props.article.authors.join(', ')}
										</span> :
										null}
									{this.props.article.authors.length && this.props.article.datePublished ?
										<span className="spacer">|</span> :
										null}
									{this.props.article.datePublished ?
										<span className="date">
											{formatTimestamp(this.props.article.datePublished)}
										</span> :
										null}
									{this.props.article.authors.length || this.props.article.datePublished ?
										<span className="spacer">|</span> :
										null}
									<span className="length">
										{estimatedReadTime}
									</span>
								</div>
							</div>
							<div className="stats">
								<div className="stat reads">
									<span>{this.props.article.readCount} {formatCountable(this.props.article.readCount, 'read')}</span>
								</div>
								<a
									className="stat comments"
									href={commentsLinkHref}
									onClick={this._viewComments}
								>
									<span>{this.props.article.commentCount} {formatCountable(this.props.article.commentCount, 'comment')}</span>
								</a>
								{averageRatingScore != null ?
									<div className="stat rating">
										<span>{averageRatingScore}</span>
									</div> :
									null}
							</div>
						</div>
						<div className="progress">
							<div className="meter">
								<div
									className={classNames('fill', { 'read': this.props.article.isRead })}
									style={{ height: this.props.article.percentComplete + '%' }}
								></div>
								<div className="description">
									<strong>{Math.floor(this.props.article.percentComplete)}%</strong> complete
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}