import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Fetchable from '../api/Fetchable';
import Comment from '../api/models/Comment';
import CommentList from './CommentList';

export default class InboxPage extends ContextComponent<{}, { replies: Fetchable<Comment[]> }> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _goToThread = (comment: Comment) => {
		const slugParts = comment.articleSlug.split('_');
		this.context.router.push(`/articles/${slugParts[0]}/${slugParts[1]}`);
	};
	private _loadReplies = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.listReplies(replies => this.setState({ replies }, () => this.context.page.setState({ isLoading: false })));
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			replies: this.context.api.listReplies(replies => this.setState({ replies }, () => this.context.page.setState({ isLoading: false })))
		};
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'Inbox',
			isLoading: this.state.replies.isLoading
		});
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
		this.context.page.addListener('reload', this._loadReplies);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
		this.context.page.removeListener('reload', this._loadReplies);
	}
	public render() {
		return (
			<div className="inbox-page">
				<div className="replies">
					{!this.state.replies.isLoading ?
						this.state.replies.value ?
							this.state.replies.value.length ?
								<CommentList comments={this.state.replies.value} mode="link" onViewThread={this._goToThread} /> :
								<span>No replies found! (No one likes you!)</span> :
							<span>Error loading comments.</span> :
						null}
				</div>
			</div>
		);
	}
}