// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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
import { AggregateRating } from 'schema-dts';
import { JsonLd } from 'react-schemaorg';
import { DeviceType } from '../../../../common/DeviceType';
import { ShareChannelData } from '../../../../common/sharing/ShareData';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { Screen, SharedState } from '../Root';
import produce from 'immer';
import { mergeComment, updateComment } from '../../../../common/comments';

export function getPathParams(location: RouteLocation) {
	const params = findRouteByLocation(
		routes,
		location,
		unroutableQueryStringKeys
	).getPathParams(location.path);
	let result = {
		slug: createArticleSlug(params),
	} as {
		commentId?: string;
		slug: string;
	};
	if ('commentId' in params) {
		result.commentId = params['commentId'];
	}
	return result;
}
function createTitle(article: Fetchable<UserArticle>) {
	if (article.isLoading) {
		return {
			default: 'Loading...'
		};
	}
	if (!article.value) {
		return {
			default: 'Article not found'
		};
	}
	return {
		default: 'Comments',
		seo: `Comments on “${article.value.title}” • Readup`
	};
}
export interface Props {
	article: Fetchable<UserArticle>;
	articleSlug: string;
	deviceType: DeviceType;
	highlightedCommentId: string | null;
	location: RouteLocation;
	onBeginOnboarding: (analyticsAction: string) => void;
	onCloseDialog: () => void;
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void;
	onCreateAbsoluteUrl: (path: string) => string;
	onCreateStaticContentUrl: (path: string) => string;
	onDeleteComment: (form: CommentDeletionForm) => Promise<CommentThread>;
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>;
	onNavTo: (url: string) => boolean;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onOpenNewPlatformNotificationRequestDialog: () => void;
	onPostArticle: (article: UserArticle) => void;
	onPostComment: (form: CommentForm) => Promise<CommentThread>;
	onPostCommentAddendum: (form: CommentAddendumForm) => Promise<CommentThread>;
	onPostCommentRevision: (form: CommentRevisionForm) => Promise<CommentThread>;
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>;
	onReadArticle: (
		article: UserArticle,
		e: React.MouseEvent<HTMLElement>
	) => void;
	onRegisterArticleChangeHandler: (
		handler: (event: ArticleUpdatedEvent) => void
	) => Function;
	onRegisterCommentPostedHandler: (
		handler: (comment: CommentThread) => void
	) => Function;
	onRegisterCommentUpdatedHandler: (
		handler: (comment: CommentThread) => void
	) => Function;
	onRegisterUserChangeHandler: (
		handler: (user: UserAccount | null) => void
	) => Function;
	onReloadArticle: (screenId: number, slug: string) => void;
	onSetScreenState: (
		id: number,
		getNextState: (
			currentState: Readonly<Screen<Fetchable<UserArticle>>>
		) => Partial<Screen<Fetchable<UserArticle>>>
	) => void;
	onShare: (data: ShareEvent) => ShareResponse;
	onShareViaChannel: (data: ShareChannelData) => void;
	onToggleArticleStar: (article: UserArticle) => Promise<void>;
	onViewProfile: (userName: string) => void;
	screenId: number;
	user: UserAccount | null;
}
class CommentsScreen extends React.Component<
	Props,
	{
		comments: Fetchable<CommentThread[]>;
	}
> {
	private readonly _noop = () => {};
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _postComment = (form: CommentForm) => {
		return this.props.onPostComment(form).then(() => { });
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler((event) => {
				if (
					this.props.article.value &&
					this.props.article.value.id === event.article.id
				) {
					this.props.onSetScreenState(
						this.props.screenId,
						produce((currentState: Screen<Fetchable<UserArticle>>) => {
							currentState.componentState.value = event.article;
						})
					);
				}
			}),
			props.onRegisterCommentPostedHandler((comment) => {
				if (
					this.props.article.value &&
					this.props.article.value.id === comment.articleId &&
					this.state.comments.value
				) {
					this.setState({
						comments: {
							...this.state.comments,
							value: mergeComment(comment, this.state.comments.value.slice()),
						},
					});
				}
			}),
			props.onRegisterCommentUpdatedHandler((comment) => {
				if (
					this.props.article.value &&
					this.props.article.value.id === comment.articleId &&
					this.state.comments.value
				) {
					this.setState({
						comments: {
							...this.state.comments,
							value: updateComment(comment, this.state.comments.value.slice()),
						},
					});
				}
			}),
			props.onRegisterUserChangeHandler((user) => {
				this.props.onReloadArticle(this.props.screenId, this.props.articleSlug);
			})
		);
		this.state = {
			comments: this.props.onGetComments(
				{ slug: this.props.articleSlug },
				this._asyncTracker.addCallback((comments) => {
					this.setState({ comments });
				})
			),
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (this.props.article.isLoading || this.state.comments.isLoading) {
			return (
				<LoadingOverlay />
			);
		}
		if (!(this.props.article.value && this.state.comments.value)) {
			return (
				<InfoBox style="normal">
					{!this.props.article.value ? (
						<p>Article not found.</p>
					) : (
							<p>Error loading comments.</p>
						)}
				</InfoBox>
			);
		}
		return (
			<div className="comments-screen_udh2l6">
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
						comments={this.state.comments.value}
						highlightedCommentId={this.props.highlightedCommentId}
						isAllowedToPost={this.props.article.value.isRead}
						noCommentsMessage="Be the first to post a comment on this article."
						onCloseDialog={this.props.onCloseDialog}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onDeleteComment={this.props.onDeleteComment}
						onNavTo={this.props.onNavTo}
						onOpenDialog={this.props.onOpenDialog}
						onPostComment={this._postComment}
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
						'@context': 'https://schema.org',
						'@type': 'AggregateRating',
						bestRating: '10',
						itemReviewed: {
							'@type': 'Article',
							articleSection: this.props.article.value.section,
							datePublished: this.props.article.value.datePublished,
							description: this.props.article.value.description,
							headline: this.props.article.value.title,
							name: this.props.article.value.title,
							publisher: {
								'@type': 'Organization',
								name: this.props.article.value.source,
							},
							url: this.props.article.value.url,
						},
						ratingCount: this.props.article.value.ratingCount,
						ratingExplanation:
							'Readup verifies that users have read the article to completion before allowing them to leave a rating or review.',
						ratingValue: this.props.article.value.averageRatingScore,
						reviewCount: this.props.article.value.commentCount,
					}}
				/>
			</div>
		);
	}
}
type Dependencies<TScreenKey> = Pick<
	Props,
	Exclude<
		keyof Props,
		| 'article'
		| 'articleSlug'
		| 'highlightedCommentId'
		| 'location'
		| 'onReloadArticle'
		| 'screenId'
		| 'user'
	>
> & {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>;
};
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Dependencies<TScreenKey>
) {
	const reloadArticle = (screenId: number, slug: string) => {
		deps.onGetArticle({ slug }, (article) => {
			deps.onSetScreenState(
				screenId,
				produce((currentState: Screen<Fetchable<UserArticle>>) => {
					currentState.componentState = article;
				})
			);
		});
	};
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const pathParams = getPathParams(location),
				article = deps.onGetArticle({ slug: pathParams.slug }, (article) => {
					deps.onSetScreenState(
						id,
						produce((currentState: Screen<Fetchable<UserArticle>>) => {
							currentState.componentState = article;
							currentState.title = createTitle(article);
						})
					);
				});
			return {
				id,
				componentState: article,
				key,
				location,
				title: createTitle(article),
			};
		},
		render: (
			state: Screen<Fetchable<UserArticle>>,
			sharedState: SharedState
		) => {
			const pathParams = getPathParams(state.location);
			return (
				<CommentsScreen
					{...{
						...deps,
						...sharedState,
						article: state.componentState,
						articleSlug: pathParams.slug,
						highlightedCommentId: pathParams.commentId,
						location: state.location,
						onReloadArticle: reloadArticle,
						screenId: state.id,
					}}
				/>
			);
		},
	};
}
