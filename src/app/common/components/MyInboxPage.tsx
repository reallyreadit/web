import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Fetchable from '../api/Fetchable';
import Button from './Button';
import Comment from '../api/models/Comment';
import CommentList from './CommentList';

export default class MyInboxPage extends ContextComponent<{}, { replies: Fetchable<Comment[]> }> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _refreshReplies = () => this.setState({ replies: this.context.api.listReplies(replies => this.setState({ replies })) });
	private _goToThread = (comment: Comment) => {
		const slugParts = comment.articleSlug.split('_');
		this.context.router.push(`/articles/${slugParts[0]}/${slugParts[1]}`);
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			replies: this.context.api.listReplies(replies => this.setState({ replies }))
		};
	}
	public componentWillMount() {
		this.context.pageTitle.set('My Inbox');
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
	}
	public render() {
		return (
			<div className="my-account-page">
				<h3>Replies <Button onClick={this._refreshReplies} state={this.state.replies.isLoading ? 'disabled' : 'normal'}>Refresh</Button></h3>
				{this.state.replies.isLoading ?
					<span>Loading...</span> :
					this.state.replies.isSuccessful ?
						this.state.replies.value.length ?
							<CommentList comments={this.state.replies.value} mode="link" onViewThread={this._goToThread} /> :
							<span>No replies found! (No one likes you!)</span> :
						<span>Error loading comments.</span>}
			</div>
		);
	}
}