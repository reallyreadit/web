import * as React from 'react';
import CommentThread from '../../models/CommentThread';
import CommentComposer from './CommentComposer';
import ActionLink from '../ActionLink';
import classNames from 'classnames';
import { findRouteByKey } from '../../routing/Route';
import routes from '../../routing/routes';
import ScreenKey from '../../routing/ScreenKey';
import ShareChannel from '../../sharing/ShareChannel';
import ShareData from '../../sharing/ShareData';
import AsyncTracker from '../../AsyncTracker';
import UserAccount from '../../models/UserAccount';
import { formatPossessive } from '../../format';
import ContentBox from '../ContentBox';
import PostHeader from '../PostHeader';

interface Props {
	comment: CommentThread,
	highlightedCommentId?: string,
	isAllowedToPost?: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment?: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onShare: (data: ShareData) => ShareChannel[],
	onViewProfile?: (userName: string) => void,
	parentCommentId?: string,
	user: UserAccount | null
}
export default class CommentDetails extends React.Component<Props, { showComposer: boolean }> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _commentsScreenRoute = findRouteByKey(routes, ScreenKey.Comments);
	private _showComposer = () => this.setState({ showComposer: true });
	private _hideComposer = () => this.setState({ showComposer: false });
	private _addComment = (text: string, articleId: number, parentCommentId?: string) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(this._asyncTracker.addCallback(() => {
				this.setState({ showComposer: false });
			}));
	};
	private readonly _getShareData = () => {
		const
			articleTitle = this.props.comment.articleTitle,
			commentAuthor = this.props.comment.userAccount,
			commentText = new DOMParser()
				.parseFromString(this.props.comment.text, 'text/html')
				.documentElement
				.textContent,
			quotedCommentText = commentText
				.split(/\n\n+/)
				.map((paragraph, index, paragraphs) => `"${paragraph}${index === paragraphs.length - 1 ? '"' : ''}`)
				.join('\n\n'),
			[sourceSlug, articleSlug] = this.props.comment.articleSlug.split('_'),
			shareUrl = this.props.onCreateAbsoluteUrl(
				this._commentsScreenRoute.createUrl({
					['articleSlug']: articleSlug,
					['commentId']: this.props.comment.id,
					['sourceSlug']: sourceSlug
				})
			);
		return {
			email: {
				body: `${quotedCommentText}\n\n${shareUrl}`,
				subject: (
					this.props.user && this.props.user.name === commentAuthor ?
						`My comment on "${articleTitle}"` :
						`Check out ${formatPossessive(commentAuthor)} comment on "${articleTitle}"`
				)
			},
			text: (
				this.props.user && this.props.user.name === commentAuthor ?
					commentText :
					`Check out ${formatPossessive(commentAuthor)} comment on "${articleTitle}"`
			),
			url: shareUrl
		};
	};
	constructor(props: Props) {
		super(props);
		this.state = { showComposer: false };
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ContentBox
				className={classNames(
					'comment-details_qker1u',
					{
						highlight: this.props.comment.id === this.props.highlightedCommentId
					}
				)}
			>
				<PostHeader
					userName={this.props.comment.userAccount}
					leaderboardBadge={this.props.comment.badge}
					date={this.props.comment.dateCreated}
					onCopyTextToClipboard={this.props.onCopyTextToClipboard}
					onGetShareData={this._getShareData}
					onShare={this.props.onShare}
					onViewProfile={this.props.onViewProfile}
				/>
				<div
					className="text"
					dangerouslySetInnerHTML={{ __html: this.props.comment.text.replace(/\n/g, '<br />') }}>
				</div>
				{this.state.showComposer ? 
					<CommentComposer
						articleId={this.props.comment.articleId}
						isAllowedToPost={this.props.isAllowedToPost}
						onCancel={this._hideComposer}
						onPostComment={this._addComment}
						parentCommentId={this.props.comment.id}
					/> :
					this.props.isAllowedToPost ?
						<ActionLink text="Reply" iconLeft="backward" onClick={this._showComposer} /> :
						null}
				{this.props.comment.children.length ?
					<ul className="replies">
						{this.props.comment.children.map(
							comment => (
								<li key={comment.id}>
									<CommentDetails
										comment={comment}
										highlightedCommentId={this.props.highlightedCommentId}
										isAllowedToPost={this.props.isAllowedToPost}
										onCopyTextToClipboard={this.props.onCopyTextToClipboard}
										onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
										onPostComment={this.props.onPostComment}
										onShare={this.props.onShare}
										onViewProfile={this.props.onViewProfile}
										parentCommentId={this.props.comment.id}
										user={this.props.user}
									/>
								</li>
							)
						)}
					</ul> :
					null}
			</ContentBox>
		);
	}
}