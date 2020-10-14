import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import CommentThread from '../../../../common/models/CommentThread';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import { findRouteByLocation } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { unroutableQueryStringKeys } from '../../../../common/routing/queryString';
import Rating from '../../../../common/models/Rating';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import ShareData from '../../../../common/sharing/ShareData';
import CommentsSection from '../../../../common/components/comments/CommentsSection';
import CommentForm from '../../../../common/models/social/CommentForm';
import CommentDeletionForm from '../../../../common/models/social/CommentDeletionForm';
import CommentAddendumForm from '../../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../../common/models/social/CommentRevisionForm';
import InfoBox from '../../../../common/components/InfoBox';
import Panel from '../BrowserRoot/Panel';
import GetStartedButton from '../BrowserRoot/GetStartedButton';
import { variants as marketingVariants } from '../../marketingTesting';
import { AggregateRating } from 'schema-dts';
import { JsonLd } from 'react-schemaorg';
import { DeviceType } from '../../../../common/DeviceType';

export function getPathParams(location: RouteLocation) {
	const params = findRouteByLocation(routes, location, unroutableQueryStringKeys).getPathParams(location.path);
	let result = {
		slug: params['sourceSlug'] + '_' + params['articleSlug']
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
	onBeginOnboarding: (analyticsAction: string) => void,
	onCloseDialog: () => void,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage?: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>,
	onNavTo: (url: string) => boolean,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onPostComment: (form: CommentForm) => Promise<void>,
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>,
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareResponse,
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
								<Panel className="header">
									<h1>{marketingVariant.headline}</h1>
									<h3>{marketingVariant.subtext}</h3>
									<div className="buttons">
										<GetStartedButton
											analyticsAction="CommentsScreen"
											deviceType={this.props.deviceType}
											onBeginOnboarding={this.props.onBeginOnboarding}
											onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
											onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
										/>
									</div>
								</Panel> :
								null}
							<Panel className="main">
								<ArticleDetails
									article={this.props.article.value}
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onRateArticle={this.props.onRateArticle}
									onPost={this.props.onPostArticle}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShare}
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
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onDeleteComment={this.props.onDeleteComment}
									onNavTo={this.props.onNavTo}
									onOpenDialog={this.props.onOpenDialog}
									onPostComment={this.props.onPostComment}
									onPostCommentAddendum={this.props.onPostCommentAddendum}
									onPostCommentRevision={this.props.onPostCommentRevision}
									onShare={this.props.onShare}
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