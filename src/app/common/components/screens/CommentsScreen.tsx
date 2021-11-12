import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import CommentThread from '../../../../common/models/CommentThread';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes, { createArticleSlug } from '../../../../common/routing/routes';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';
import Rating from '../../../../common/models/Rating';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import CommentsSection from '../../../../common/components/comments/CommentsSection';
import CommentForm from '../../../../common/models/social/CommentForm';
import CommentDeletionForm from '../../../../common/models/social/CommentDeletionForm';
import CommentAddendumForm from '../../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../../common/models/social/CommentRevisionForm';
import InfoBox from '../../../../common/components/InfoBox';
import Panel from '../BrowserRoot/Panel';
import { variants as marketingVariants } from '../../marketingTesting';
import { AggregateRating } from 'schema-dts';
import { JsonLd } from 'react-schemaorg';
import { DeviceType } from '../../../../common/DeviceType';
import MarketingBanner from '../BrowserRoot/MarketingBanner';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

export function getPathParams(location: RouteLocation) {
	const params = findRouteByLocation(routes, location, unroutableQueryStringKeys).getPathParams(location.path);
	let result = {
		slug: createArticleSlug(params)
	} as {
		commentId?: string,
		slug: string
	};
	if ('commentId' in params) {
		result.commentId = params['commentId'];
	}
	return result;
}
export interface Props {
	article: Fetchable<UserArticle>,
	comments: Fetchable<CommentThread[]>,
	deviceType: DeviceType,
	highlightedCommentId: string | null,
	location: RouteLocation,
	onBeginOnboarding: (analyticsAction: string) => void,
	onCloseDialog: () => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onPostComment: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}
export default class CommentsScreen extends React.PureComponent<Props> {
	private readonly _noop = () => { };
	public render() {
		const marketingVariant = marketingVariants[0];
		return (
			<div className="comments-screen_udh2l6">
				{this.props.article.isLoading || this.props.comments.isLoading ?
					<LoadingOverlay position="absolute" /> :
					!this.props.article.value || !this.props.comments.value ?
						<InfoBox
							position="absolute"
							style="normal"
						>
							{!this.props.article.value ?
								<p>Article not found.</p> :
								<p>Error loading comments.</p>}
						</InfoBox> :
						<>
							{!this.props.user ?
								<MarketingBanner
									analyticsAction="CommentsScreen"
									deviceType={this.props.deviceType}
									marketingVariant={marketingVariant}
									location={this.props.location}
									onNavTo={this.props.onNavTo}
									onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
									onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
								/> :
								null}
							<Panel className="main">
								<ArticleDetails
									article={this.props.article.value}
									deviceType={this.props.deviceType}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onNavTo={this.props.onNavTo}
									onRateArticle={this.props.onRateArticle}
									onPost={this.props.onPostArticle}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShare}
									onShareViaChannel={this.props.onShareViaChannel}
									onToggleStar={this.props.onToggleArticleStar}
									onViewComments={this._noop}
									onViewProfile={this.props.onViewProfile}
									user={this.props.user}
								/>
								<CommentsSection
									article={this.props.article.value}
									comments={this.props.comments.value}
									highlightedCommentId={this.props.highlightedCommentId}
									noCommentsMessage="Be the first to post a comment on this article."
									onCloseDialog={this.props.onCloseDialog}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onDeleteComment={this.props.onDeleteComment}
									onNavTo={this.props.onNavTo}
									onOpenDialog={this.props.onOpenDialog}
									onPostComment={this.props.onPostComment}
									onPostCommentAddendum={this.props.onPostCommentAddendum}
									onPostCommentRevision={this.props.onPostCommentRevision}
									onShare={this.props.onShare}
									onShareViaChannel={this.props.onShareViaChannel}
									onViewProfile={this.props.onViewProfile}
									user={this.props.user}
								/>
							</Panel>
							<JsonLd<AggregateRating>
								item={{
									"@context": "https://schema.org",
									"@type": "AggregateRating",
									"bestRating": "10",
									"itemReviewed": {
										"@type": "Article",
										"articleSection": this.props.article.value.section,
										"datePublished": this.props.article.value.datePublished,
										"description": this.props.article.value.description,
										"headline": this.props.article.value.title,
										"name": this.props.article.value.title,
										"publisher": {
											"@type": "Organization",
											"name": this.props.article.value.source
										},
										"url": this.props.article.value.url
									},
									"ratingCount": this.props.article.value.ratingCount,
									"ratingExplanation": "Readup verifies that users have read the article to completion before allowing them to leave a rating or review.",
									"ratingValue": this.props.article.value.averageRatingScore,
									"reviewCount": this.props.article.value.commentCount
								}}
							/>
						</>}
			</div>
		);
	}
}