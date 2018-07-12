import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import Fetchable from '../api/Fetchable';
import Comment from '../../../common/models/Comment';
import PageResult from '../../../common/models/PageResult';
import CommentList from './controls/comments/CommentList';
import { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';
import PageSelector from './controls/PageSelector';
import { getArticleUrlPath } from '../../../common/format';
import Page from './Page';

const title = 'Inbox';
export default class InboxPage extends React.Component<RouteComponentProps<{}>, { replies: Fetchable<PageResult<Comment>> }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _redirectToHomepage = () => this.context.router.history.push('/');
	private _readReply = (comment: Comment) => {
		if (!comment.dateRead) {
			this.context.api.readReply(comment.id);
		}
		this.context.router.history.push(getArticleUrlPath(comment.articleSlug) + `/${comment.id}`);
	};
	private _loadReplies = () => this.context.api.listReplies(
		this.getCurrentPage(),
		replies => {
			this.setState({ replies });
		}
	);
	private _updatePageNumber = (pageNumber: number) => {
		this.setState(
			{
				replies: {
					...this.state.replies,
					value: { ...this.state.replies.value, pageNumber },
					isLoading: true
				}
			},
			this._loadReplies
		);
	};
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = { replies: this._loadReplies() };
	}
	private getCurrentPage() {
		return (this.state && this.state.replies && this.state.replies.value && this.state.replies.value.pageNumber) || 1;
	}
	public componentWillMount() {
		if (hasNewUnreadReply(this.context.page.newReplyNotification)) {
			const now = Date.now();
			this.context.page.setNewReplyNotification({
				...this.context.page.newReplyNotification,
				lastNewReplyAck: now,
				timestamp: now
			});
		}
		this.context.page.setTitle(title);
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
	}
	public render() {
		return (
			<Page className="inbox-page" title={title}>
				<div className="replies">
					{!this.state.replies.isLoading ?
						this.state.replies.value ?
							this.state.replies.value.items.length ?
								<CommentList comments={this.state.replies.value.items} mode="link" onViewThread={this._readReply} /> :
								<span>No replies found. When someone replies to one of your comments it will show up here.</span> :
							<span>Error loading replies.</span> :
						<span>Loading...</span>}
				</div>
				<PageSelector
					pageNumber={this.getCurrentPage()}
					pageCount={this.state.replies.value ? this.state.replies.value.pageCount : 1}
					onChange={this._updatePageNumber}
					disabled={this.state.replies.isLoading}
				/>
			</Page>
		);
	}
}