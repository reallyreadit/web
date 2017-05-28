import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Fetchable from '../api/Fetchable';
import Comment from '../api/models/Comment';
import CommentList from './CommentList';

export default class InboxPage extends ContextComponent<{}, { replies: Fetchable<Comment[]> }> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _readReply = (comment: Comment) => {
		const slugParts = comment.articleSlug.split('_');
		if (!comment.dateRead) {
			this.context.api.readReply(comment.id);
		}
		this.context.router.push(`/articles/${slugParts[0]}/${slugParts[1]}/${comment.id}`);
	};
	private _loadReplies = () => this.context.api.listReplies(replies => this.setState({ replies }, () => this.context.page.setState({ isLoading: false })));
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this._loadReplies();
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = { replies: this._loadReplies() };
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'Inbox',
			isLoading: this.state.replies.isLoading,
			isReloadable: true
		});
		this.context.page.ackNewReply();
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
							this.state.replies.value.length ?
								<CommentList comments={this.state.replies.value} mode="link" onViewThread={this._readReply} /> :
								<span>No replies found.</span> :
							<span>Error loading replies.</span> :
						null}
				</div>
			</div>
		);
	}
}