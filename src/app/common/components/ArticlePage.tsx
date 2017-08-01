import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Fetchable from '../api/Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import Comment from '../../../common/models/Comment';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';
import readingParameters from '../../../common/readingParameters';
import CommentList from './CommentList';
import CommentBox from './CommentBox';
import { State as PageState } from '../Page';

type Props = RouteComponentProps<{
	sourceSlug: string,
	articleSlug: string,
	commentId: string
}>;
export default class ArticlePage extends ContextComponent<Props, {
	article: Fetchable<UserArticle>,
	comments: Fetchable<Comment[]>
}> {
	private static findComment(id: string, comment: Comment) {
		if (comment.id === id) {
			return comment;
		}
		let match: Comment = null;
		for (let i = 0; match == null && i < comment.children.length; i++) {
			match = ArticlePage.findComment(id, comment.children[i]);
		}
		return match;
	}
	private _slug: string;
	private _loadArticle = () => this.context.api.getArticleDetails(this._slug, article => this.setState({ article }, this._updatePageState));
	private _loadComments = () => this.context.api.listComments(this._slug, comments => this.setState({ comments }, this._updatePageState));
	private _addComment = (comment: Comment) => {
		this.setState({ comments: { ...this.state.comments, value: [comment, ...this.state.comments.value] }});
		this.incrementCommentCount();
	};
	private _addReply = (comment: Comment) => {
		const comments = this.state.comments.value.slice();
		let parent: Comment = null;
		for (let i = 0; parent == null && i < comments.length; i++) {
			if (comments[i].id === comment.parentCommentId) {
				parent = comments[i];
			} else {
				parent = ArticlePage.findComment(comment.parentCommentId, comments[i]);
			}
		}
		parent.children.push(comment);
		this.setState({ comments: { ...this.state.comments, value: comments } });
		this.incrementCommentCount();
	};
	private _updatePageState = () => {
		if (!this.state.article.isLoading) {
			const state: Partial<PageState> = { title: this.state.article.value.title };
			if (!this.state.comments.isLoading) {
				state.isLoading = false;
			}
			this.context.page.setState(state);
		}
	};
	private _updateArticle = (article: UserArticle) => this.setState({
		article: {
			...this.state.article,
			value: article
		}
	});
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this._loadArticle();
		this._loadComments();
	};
	constructor(props: Props, context: Context) {
		super(props, context);
		this._slug = this.props.match.params.sourceSlug + '_' + this.props.match.params.articleSlug;
		this.state = {
			article: this._loadArticle(),
			comments: this._loadComments()
		};
	}
	private incrementCommentCount() {
		this.setState({
			article: {
				...this.state.article,
				value: { ...this.state.article.value, commentCount: this.state.article.value.commentCount + 1 }
			}
		});
	}
	public componentWillMount() {
		this.context.page.setState({
			title: this.state.article.isLoading ? 'Loading...' : this.state.article.value.title,
			isLoading: this.state.article.isLoading || this.state.comments.isLoading,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.user.addListener('authChange', this._reload);
		this.context.page.addListener('reload', this._reload);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._reload);
		this.context.page.removeListener('reload', this._reload);
	}
	public render() {
		const isAllowedToPost = this.state.article.value &&
			this.context.user.isSignedIn &&
			this.state.article.value.percentComplete >= readingParameters.articleUnlockThreshold;
		return (
			<div className="article-page">
				<ArticleList>
					{!this.state.article.isLoading ?
						this.state.article.value ?
							<li>
								<ArticleDetails
									article={this.state.article.value}
									showStarControl={this.context.user.isSignedIn}
									onChange={this._updateArticle}
								/>
							</li> :
							<li>Error loading article.</li> :
						<li>Loading...</li>}
				</ArticleList>
				<h3>Comments</h3>
				<CommentBox
					articleId={(this.state.article.value && this.state.article.value.id) || null}
					isAllowedToPost={isAllowedToPost}
					onCommentPosted={this._addComment}
				/>
				{!this.state.comments.isLoading ?
					this.state.comments.value ?
						this.state.comments.value.length ?
							<CommentList
								comments={this.state.comments.value}
								mode="reply"
								isAllowedToPost={isAllowedToPost}
								onCommentAdded={this._addReply}
								highlightedCommentId={this.props.match.params.commentId}
							/> :
							<span>No comments found! (Post one!)</span> :
						<span>Error loading comments.</span> :
					<span>Loading...</span>}
			</div>
		);
	}
}