import * as React from 'react';
import UserArticle from '../models/UserArticle';
import { formatTimestamp, formatCountable, truncateText } from '../format';
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
import Link from './Link';
import { NavReference } from '../../app/common/components/Root';
import { DeviceType, isMobileDevice } from '../DeviceType';
import { ShareChannelData } from '../sharing/ShareData';
import * as classnames from 'classnames';
import ImageComponent from './Image';

interface Props {
	article: UserArticle,
	className?: string,
	deviceType: DeviceType,
	highlight?: boolean,
	onCreateAbsoluteUrl: (path: string) => string,
	onNavTo: (ref: NavReference) => void,
	onPost: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onRead: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	pointsCallout?: React.ReactNode,
	rankCallout?: React.ReactNode,
	shareMenuPosition?: MenuPosition,
	showAotdMetadata?: boolean,
	showDescription?: boolean,
	showImage?: boolean,
	user?: UserAccount
}
export default class extends React.PureComponent<Props, {
		isStarring: boolean,
	}> {
	public static defaultProps: Pick<Props, 'shareMenuPosition' | 'showAotdMetadata' | 'showImage'> = {
		shareMenuPosition: MenuPosition.LeftTop,
		showAotdMetadata: true,
		showImage: false
	};
	protected readonly _getShareData = () => {
		return getShareData(
			'Article',
			this.props.article,
			this.props.onCreateAbsoluteUrl
		);
	};
	protected readonly _shouldShowImage = () => {
		return this.props.showImage && this.props.article.imageUrl;
	}
	protected readonly _read = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		// e.preventDefault(); // this might break the browser behavior
		this.props.onRead(this.props.article, e);
	};
	protected readonly _toggleStar = (ev?: React.MouseEvent) => {
		if (ev) ev.stopPropagation();
		this.setState({ isStarring: true });
		this.props
			.onToggleStar(this.props.article)
			.then(() => { this.setState({ isStarring: false }); })
			.catch(() => { this.setState({ isStarring: false }); })
	};
	protected readonly _viewComments = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		e.preventDefault();
		this.props.onViewComments(this.props.article);
	};

	protected _articleUrlParams: {
		articleSlug: string;
		sourceSlug: string;
	};
	protected _authorLinks: JSX.Element[];
	protected _commentsLinkHref: string;
	protected _estimatedReadTime: string;
	protected _ratingControl: React.ReactElement<RatingControl>;
	protected _shareControl: React.ReactElement<ShareControl>;
	protected MAX_DESCRIPTION_LENGTH = 250;

	constructor(props: Props) {
		super(props);
		this.state = {
			isStarring: false,
		};

		// rating control
		this._ratingControl = (
			<RatingControl
				article={this.props.article}
				menuPosition={MenuPosition.TopCenter}
				onRateArticle={this.props.onRateArticle}
				stopPropagation={true}
			/>
		);

		// author links
		this._authorLinks = this.props.article.articleAuthors.map(
			(author, index, authors) => (
				<React.Fragment key={author.slug}>
					<Link className="data" screen={ScreenKey.Author} params={{ 'slug': author.slug }} onClick={this.props.onNavTo} text={author.name} stopPropagation={true} />
					{index !== authors.length - 1 ?
						<span>, </span> :
						null}
				</React.Fragment>
			)
		);

		// share control
		this._shareControl = (
			<ShareControl
				onGetData={this._getShareData}
				onShare={this.props.onShare}
				onShareViaChannel={this.props.onShareViaChannel}
				menuPosition={!isMobileDevice(this.props.deviceType) ? this.props.shareMenuPosition : MenuPosition.LeftTop}
				stopPropagation={true}
			>
				<Icon
					display="block"
					name={ this.props.deviceType === DeviceType.Ios ? "share" : "share-android" }
				/>
			</ShareControl>
		);

		const [sourceSlug, articleSlug] = this.props.article.slug.split('_');
		this._articleUrlParams = {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		};

		this._estimatedReadTime = calculateEstimatedReadTime(this.props.article.wordCount) + ' min';

		// comments link
		this._commentsLinkHref = findRouteByKey(routes, ScreenKey.Comments)
			.createUrl(this._articleUrlParams);

		}
	public render() {
		return (
			<div className={classnames( "article-details_d2vnmv", {"has-image": this._shouldShowImage()}, this.props.className )}>
				{this.props.showAotdMetadata ?
					<AotdMetadata
						article={this.props.article}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onViewProfile={this.props.onViewProfile}
						pointsCallout={this.props.pointsCallout}
						rankCallout={this.props.rankCallout}
					/> :
					null}
				<div
					className="article-container"
					onClick={this._read}
				>
					{
						 this._shouldShowImage() ?
							<ImageComponent src={this.props.article.imageUrl} /> :
							null
					}
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
							{this._shareControl}
							{!this.props.article.isRead && this.props.article.percentComplete >= 1 ?
								<div className="bookmark">
									<span className="percent-complete">{Math.floor(this.props.article.percentComplete)}%</span>
									<Icon name="bookmark" />
								</div> :
								null}
							<a
								className="title-link"
								href={this.props.article.url}
							>
								{this.props.article.title}
							</a>
						</div>
						<div className="columns">
							<div className="article">
								<div className="meta">
									<span>{this.props.article.source}</span>
									<i className="spacer"></i>
									{this._authorLinks}
									{this._authorLinks.length ?
										<i className="spacer"></i> :
										null}
									{this.props.article.datePublished ?
										<>
											<span>{formatTimestamp(this.props.article.datePublished)}</span>
											<i className="spacer"></i>
										</> :
										null}
									<span>{this._estimatedReadTime}</span>
								</div>
								{
									this.props.showDescription && !!this.props.article.description ?
										<p className="description">{truncateText(this.props.article.description, this.MAX_DESCRIPTION_LENGTH)}</p> : null
								}
								<div className="stats">
									<span className="reads">{this.props.article.readCount} {formatCountable(this.props.article.readCount, 'read')}</span>
									<a
										className="comments"
										href={this._commentsLinkHref}
										onClick={this._viewComments}
									>
										{this.props.article.commentCount} {formatCountable(this.props.article.commentCount, 'comment')}
									</a>
									{this._ratingControl}
								</div>
							</div>
							<div className="small-stats-article">
								<div className="meta">
									<div className="publisher">
										{this.props.article.source}
									</div>
									<div className="author-date-length">
										{this._authorLinks.length ?
											<span className="author">
												{this._authorLinks}
											</span> :
											null}
										{this._authorLinks.length && this.props.article.datePublished ?
											<span className="spacer"></span> :
											null}
										{this.props.article.datePublished ?
											<span className="date">
												{formatTimestamp(this.props.article.datePublished)}
											</span> :
											null}
										{this._authorLinks.length || this.props.article.datePublished ?
											<span className="spacer"></span> :
											null}
										<span className="length">
											{this._estimatedReadTime}
										</span>
									</div>
								</div>
								{
									this.props.showDescription && !!this.props.article.description ?
										<p className="description">{this.props.article.description}</p> : null
								}
								<div className="stats">
									<div className="reads">
										<span>{this.props.article.readCount} {formatCountable(this.props.article.readCount, 'read')}</span>
									</div>
									<div className="comments">
										<a
											href={this._commentsLinkHref}
											onClick={this._viewComments}
										>
											{this.props.article.commentCount} {formatCountable(this.props.article.commentCount, 'comment')}
										</a>
									</div>
									{this._ratingControl}

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
										stopPropagation={true}
									/>
								</div> :
								null}
						</div>
					</ContentBox>
				</div>
			</div>
		);
	}
}