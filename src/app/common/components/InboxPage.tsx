import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import Fetchable from '../api/Fetchable';
import Comment from '../../../common/models/Comment';
import PageResult from '../../../common/models/PageResult';
import CommentList from './controls/comments/CommentList';
import { hasNewUnreadReply } from '../../../common/models/NewReplyNotification';
import PageSelector from './controls/PageSelector';

export default class InboxPage extends React.Component<RouteComponentProps<{}>, { replies: Fetchable<PageResult<Comment>> }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _redirectToHomepage = () => this.context.router.history.push('/');
	private _readReply = (comment: Comment) => {
		const slugParts = comment.articleSlug.split('_');
		if (!comment.dateRead) {
			this.context.api.readReply(comment.id);
		}
		this.context.router.history.push(`/articles/${slugParts[0]}/${slugParts[1]}/${comment.id}`);
	};
	private _loadReplies = () => this.context.api.listReplies(
		this.getCurrentPage(),
		replies => {
			this.setState({ replies });
			this.context.page.setState({ isLoading: false });
		}
	);
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this._loadReplies();
	};
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
		this.context.page.setState({ isLoading: true });
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
		this.context.page.setState({
			title: 'Inbox',
			isLoading: this.state.replies.isLoading,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
		this.context.page.addListener('reload', this._reload);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
		this.context.page.removeListener('reload', this._reload);
	}
	public render() {
		return (
			<div className="inbox-page">
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
			</div>
		);
	}
}