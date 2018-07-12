import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import Fetchable from '../api/Fetchable';
import UserArticle from '../../../common/models/UserArticle';
import Comment from '../../../common/models/Comment';
import ArticleList from './controls/articles/ArticleList';
import ArticleDetails from './controls/articles/ArticleDetails';
import CommentList from './controls/comments/CommentList';
import CommentBox from './controls/comments/CommentBox';
import ShareArticleDialog from './ShareArticleDialog';
import Page from './Page';

type Props = RouteComponentProps<{
	sourceSlug: string,
	articleSlug: string,
	commentId: string
}>;
export default class ArticlePage extends React.Component<Props, {
	article: Fetchable<UserArticle>,
	comments: Fetchable<Comment[]>
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private static findComment(id: number, comment: Comment) {
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
	private _loadArticle = () => this.context.api.getArticleDetails(this._slug, article => {
		this.setState({ article }, () => this.setDocumentTitle());
	});
	private _loadComments = () => this.context.api.listComments(this._slug, comments => this.setState({ comments }));
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
	private _updateArticle = (article: UserArticle) => {
		if (article.id === this.state.article.value.id) {
			this.setState({
				article: {
					...this.state.article,
					value: article
				}
			});
		}
	};
	private _updateArticleFromEnvironment = (data: { article: UserArticle, isCompletionCommit: boolean }) => {
		this._updateArticle(data.article);
	};
	private _reload = () => {
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
	private setDocumentTitle() {
		let title: string;
		if (this.state.article.isLoading) {
			title = 'Loading...';
		} else if (!this.state.article.errors) {
			title = this.state.article.value.title;
		} else {
			title = 'Error';
		}
		this.context.page.setTitle(title);
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
		if (
			this.context.router.route.location.search === '?share' &&
			!this.state.article.isLoading
		) {
			this.context.page.openDialog(
				React.createElement(
					ShareArticleDialog,
					{ article: this.state.article.value }
				)
			);
		}
		this.setDocumentTitle();
	}
	public componentDidMount() {
		if (this.context.router.route.location.search) {
			this.context.router.history.push(this.context.router.route.location.pathname);
		}
		this.context.user.addListener('authChange', this._reload);
		this.context.environment.addListener('articleUpdated', this._updateArticleFromEnvironment);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._reload);
		this.context.environment.removeListener('articleUpdated', this._updateArticleFromEnvironment);
	}
	public render() {
		const isAllowedToPost = this.state.article.value && this.context.user.isSignedIn && this.state.article.value.isRead;
		return (
			<Page className="article-page">
				<ArticleList>
					{!this.state.article.isLoading ?
						this.state.article.value ?
							<li>
								<ArticleDetails
									article={this.state.article.value}
									isUserSignedIn={this.context.user.isSignedIn}
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
								highlightedCommentId={this.props.match.params.commentId ? parseInt(this.props.match.params.commentId) : null}
							/> :
							<span>No comments found! (Post one!)</span> :
						<span>Error loading comments.</span> :
					<span>Loading...</span>}
			</Page>
		);
	}
}