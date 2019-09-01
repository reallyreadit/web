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
import { calculateEstimatedReadTime } from '../calculate';
import getShareData from '../sharing/getShareData';
import ContentBox from './ContentBox';
import PostButton from './PostButton';

interface Props {
	article: UserArticle,
	imagePath?: string,
	isUserSignedIn: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPost: (article: UserArticle) => void,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	shareMenuPosition?: MenuPosition,
	useAbsoluteUrls?: boolean
}
export default class extends React.PureComponent<Props, { isStarring: boolean }> {
	public static defaultProps: Partial<Props> = {
		imagePath: '/images',
		shareMenuPosition: MenuPosition.RightMiddle
	};
	private readonly _getShareData = () => {
		return getShareData(
			this.props.article,
			this.props.onCreateAbsoluteUrl
		);
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
		// rating image
		const ratingStyle = {
			backgroundImage: `url(${this.props.imagePath}/rating-seal.svg)`
		};
		// share
		const shareControl = (
			<ShareControl
				onCopyTextToClipboard={this.props.onCopyTextToClipboard}
				onGetData={this._getShareData}
				onShare={this.props.onShare}
				menuPosition={this.props.shareMenuPosition}
			>
				<Icon
					display="block"
					name="share"
				/>
			</ShareControl>
		);
		return (
			<ContentBox className="article-details_d2vnmv">
				<div className="title">
					{this.props.isUserSignedIn ?
						<Star
							starred={!!this.props.article.dateStarred}
							busy={this.state.isStarring}
							onClick={this._toggleStar}
						/> :
						null}
					{!this.props.article.isRead && this.props.article.percentComplete >= 1 ?
						<div className="bookmark">
							<span className="percent-complete">{Math.floor(this.props.article.percentComplete)}%</span>
							<Icon name="bookmark" />
						</div> :
						null}
					<a
						className="title-link"
						href={this.props.article.url}
						onClick={this._read}
					>
						{this.props.article.title}
					</a>
				</div>
				<div className="columns">
					<div className="article">
						<div className="meta">
							{publisherMetadata.join(' | ')}
						</div>
						<div className="stats">
							<span className="reads">{this.props.article.readCount} {formatCountable(this.props.article.readCount, 'read')}</span>
							<a
								className="comments"
								href={commentsLinkHref}
								onClick={this._viewComments}
							>
								{this.props.article.commentCount} {formatCountable(this.props.article.commentCount, 'comment')}
							</a>
							{averageRatingScore != null ?
								<div
									className="rating"
									style={ratingStyle}
								>
									<span>{averageRatingScore}</span>
								</div> :
								null}
							{shareControl}
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
							<div className="reads">
								<span>{this.props.article.readCount} {formatCountable(this.props.article.readCount, 'read')}</span>
							</div>
							<div className="comments">
								<a
									href={commentsLinkHref}
									onClick={this._viewComments}
								>
									{this.props.article.commentCount} {formatCountable(this.props.article.commentCount, 'comment')}
								</a>
							</div>
							{averageRatingScore != null ?
								<div
									className="rating"
									style={ratingStyle}
								>
									<span>{averageRatingScore}</span>
								</div> :
								null}
							{shareControl}
						</div>
					</div>
					{(
						this.props.onPost &&
						(this.props.article.isRead || this.props.article.datePosted)
					 ) ?
						<div className="post">
							<PostButton
								article={this.props.article}
								onPost={this.props.onPost}
							/>
						</div> :
						null}
				</div>
			</ContentBox>
		);
	}
}