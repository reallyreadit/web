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
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostComment?: (text: string, articleId: number, parentCommentId?: string) => Promise<void>,
	onShare: (data: ShareData) => ShareChannel[],
	onViewProfile?: (userName: string) => void,
	onViewThread?: (comment: CommentThread) => void,
	parentCommentId?: string,
	user: UserAccount | null
}
export default class CommentDetails extends React.Component<
	Props,
	{
		fadeHighlight: boolean,
		showComposer: boolean
}> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _elementRef: React.RefObject<HTMLDivElement>;
	private _intersectionObserver: IntersectionObserver;
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
	private readonly _viewThread = () => {
		this.props.onViewThread(this.props.comment);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			fadeHighlight: false,
			showComposer: false
		};
		if (props.highlightedCommentId === props.comment.id) {
			this._elementRef = React.createRef();
		}
	}
	public componentDidMount() {
		if (this.props.highlightedCommentId === this.props.comment.id) {
			this._asyncTracker.addTimeout(
				window.setTimeout(
					() => {
						this._intersectionObserver = new IntersectionObserver(
							entries => {
								const entry = entries[0];
								if (entry && entry.isIntersecting) {
									this.setState({ fadeHighlight: true });
									this._intersectionObserver.unobserve(entry.target);
								}
							}
						);
						this._intersectionObserver.observe(this._elementRef.current);
						this._elementRef.current.scrollIntoView({
							behavior: 'smooth',
							block: 'start'
						});
					},
					100
				)
			);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
		if (this._intersectionObserver) {
			this._intersectionObserver.disconnect();
		}
	}
	public render() {
		return (
			<div
				className={classNames(
					'comment-details_qker1u',
					{
						'fade-highlight': this.state.fadeHighlight,
						'highlight': this.props.highlightedCommentId === this.props.comment.id,
						'post-embed': !!this.props.onViewThread
					}
				)}
				ref={this._elementRef}
			>
				<ContentBox>
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
						dangerouslySetInnerHTML={{ __html: this.props.comment.text.replace(/\n/g, '<br />') }}
					/>
					{this.state.showComposer ? 
						<CommentComposer
							articleId={this.props.comment.articleId}
							onCancel={this._hideComposer}
							onPostComment={this._addComment}
							parentCommentId={this.props.comment.id}
						/> :
						this.props.onPostComment || this.props.onViewThread ?
							<div className="actions">
								{this.props.onPostComment ?
									<ActionLink
										text="Reply"
										onClick={this._showComposer}
									/> :
									this.props.onViewThread ?
										<ActionLink
											text="View Thread"
											onClick={this._viewThread} 
										/> :
										null}
							</div> :
							null}
					{this.props.comment.children.length ?
						<ul className="replies">
							{this.props.comment.children.map(
								comment => (
									<li key={comment.id}>
										<CommentDetails
											comment={comment}
											highlightedCommentId={this.props.highlightedCommentId}
											onCopyTextToClipboard={this.props.onCopyTextToClipboard}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onPostComment={this.props.onPostComment}
											onShare={this.props.onShare}
											onViewProfile={this.props.onViewProfile}
											onViewThread={this.props.onViewThread}
											parentCommentId={this.props.comment.id}
											user={this.props.user}
										/>
									</li>
								)
							)}
						</ul> :
						null}
				</ContentBox>
			</div>
		);
	}
}