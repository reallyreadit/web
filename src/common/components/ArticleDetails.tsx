import * as React from 'react';
import UserArticle from '../models/UserArticle';
import { formatTimestamp, formatCountable } from '../format';
import Star from './Star';
import ScreenKey from '../routing/ScreenKey';
import routes from '../routing/routes';
import { findRouteByKey } from '../routing/Route';
import ShareControl, { MenuPosition } from './ShareControl';
import Icon from './Icon';
import { ShareEvent } from '../sharing/ShareEvent';
import ShareResponse from '../sharing/ShareResponse';
import { calculateEstimatedReadTime } from '../calculate';
import getShareData from '../sharing/getShareData';
import ContentBox from './ContentBox';
import PostButton from './PostButton';
import RatingControl from './RatingControl';
import Rating from '../models/Rating';
import AotdMetadata from './AotdMetadata';
import UserAccount from '../models/UserAccount';

interface Props {
	article: UserArticle,
	highlight?: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPost: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	pointsCallout?: React.ReactNode,
	rankCallout?: React.ReactNode,
	shareMenuPosition?: MenuPosition,
	showAotdMetadata?: boolean,
	useAbsoluteUrls?: boolean,
	user?: UserAccount
}
export default class extends React.PureComponent<Props, { isStarring: boolean }> {
	public static defaultProps: Partial<Props> = {
		shareMenuPosition: MenuPosition.RightMiddle,
		showAotdMetadata: true
	};
	private readonly _getShareData = () => {
		return getShareData(
			'Article',
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
			estimatedReadTime = calculateEstimatedReadTime(this.props.article.wordCount) + ' min';
		// publisher metadata
		const publisherMetadata = [this.props.article.source];
		if (this.props.article.articleAuthors.length) {
			publisherMetadata.push(
				this.props.article.articleAuthors.map(author => author.name).join(', ')
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
		// rating control
		const ratingControl = (
			<RatingControl
				article={this.props.article}
				menuPosition={MenuPosition.TopCenter}
				onRateArticle={this.props.onRateArticle}
			/>
		);
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
			<div className="article-details_d2vnmv">
				{this.props.showAotdMetadata ?
					<AotdMetadata
						article={this.props.article}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onViewProfile={this.props.onViewProfile}
						pointsCallout={this.props.pointsCallout}
						rankCallout={this.props.rankCallout}
					/> :
					null}
				<ContentBox
					className="content"
					highlight={this.props.highlight}
				>
					<div className="title">
						{this.props.user ?
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
								{ratingControl}
								{shareControl}
							</div>
						</div>
						<div className="small-stats-article">
							<div className="meta">
								<div className="publisher">
									{this.props.article.source}
								</div>
								<div className="author-date-length">
									{this.props.article.articleAuthors.length ?
										<span className="author">
											{this.props.article.articleAuthors.map(author => author.name).join(', ')}
										</span> :
										null}
									{this.props.article.articleAuthors.length && this.props.article.datePublished ?
										<span className="spacer">|</span> :
										null}
									{this.props.article.datePublished ?
										<span className="date">
											{formatTimestamp(this.props.article.datePublished)}
										</span> :
										null}
									{this.props.article.articleAuthors.length || this.props.article.datePublished ?
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
								{ratingControl}
								{shareControl}
							</div>
						</div>
						{(
							this.props.onPost &&
							(this.props.article.isRead || this.props.article.datesPosted.length)
						) ?
							<div className="post">
								<PostButton
									article={this.props.article}
									menuPosition={MenuPosition.LeftMiddle}
									onPost={this.props.onPost}
								/>
							</div> :
							null}
					</div>
				</ContentBox>
			</div>
		);
	}
}