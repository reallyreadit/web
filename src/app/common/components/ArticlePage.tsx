import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Fetchable from '../api/Fetchable';
import Article from '../api/models/Article';
import Comment from '../api/models/Comment';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';
import Button from './Button';
import readingParameters from '../../../common/readingParameters';
import CommentList from './CommentList';
import CommentBox from './CommentBox';

interface Props {
	params: {
		source: string,
		article: string,
	}
}
export default class ArticlePage extends ContextComponent<Props, {
	article: Fetchable<Article>,
	comments: Fetchable<Comment[]>
}> {
	private _slug: string;
	private _refreshArticle = () => this.setState({ article: this.context.api.getArticleDetails(this._slug, article => this.setState({ article })) });
	private _refreshArticleAndComments = () => {
		this._refreshArticle();
		this.setState({ comments: this.context.api.listComments(this._slug, comments => this.setState({ comments })) });
	}
	private _handleUserChange = () => {
		this.forceUpdate();
		this._refreshArticleAndComments();
	};
	private _addComment = (comment: Comment) => {
		const comments = this.state.comments.value.slice();
		comments.splice(Math.max(comments.findIndex(c => c.dateCreated < comment.dateCreated), 0), 0, comment);
		this.setState({ comments: { ...this.state.comments, value: comments }});
		this._refreshArticle();
	};
	constructor(props: Props, context: Context) {
		super(props, context);
		this._slug = this.props.params.source + '_' + this.props.params.article;
		this.state = {
			article: this.context.api.getArticleDetails(this._slug, article => this.setState({ article }, () => this.setPageTitle())),
			comments: this.context.api.listComments(this._slug, comments => this.setState({ comments }))
		};
	}
	private setPageTitle() {
		this.context.pageTitle.set(this.state.article.isLoading ?
			'Loading...' :
				this.state.article.isSuccessful ?
					this.state.article.value.title :
					'Error loading article.');
	}
	public componentWillMount() {
		this.setPageTitle();
	}
	public componentDidMount() {
		this.context.user
			.addListener('signIn', this._handleUserChange)
			.addListener('signOut', this._handleUserChange);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signIn', this._handleUserChange)
			.removeListener('signOut', this._handleUserChange);
	}
	public render() {
		const isAllowedToPost = this.state.article.value && this.context.user.isSignedIn() && this.state.article.value.percentComplete >= readingParameters.articleUnlockThreshold;
		return (
			<div className="article-page">
				<Button onClick={this._refreshArticleAndComments} state={this.state.article.isLoading || this.state.comments.isLoading ? 'disabled' : 'normal'}>Refresh</Button>
				<ArticleList>
					{this.state.article.isLoading ?
						<li>Loading...</li> :
						this.state.article.isSuccessful ?
							<li><ArticleDetails article={this.state.article.value} /></li> :
							<li>Error loading article.</li>}
				</ArticleList>
				<h3>Comments</h3>
				{this.state.comments.isLoading ?
					<span>Loading...</span> :
					this.state.comments.isSuccessful ?
						this.state.comments.value.length ?
							<CommentList comments={this.state.comments.value} isAllowedToPost={isAllowedToPost} onCommentAdded={this._refreshArticle} /> :
							<span>No comments found! (Post one!)</span> :
						<span>Error loading comments.</span>}
				<hr />
				<div className="comment-box-wrapper">
					<CommentBox articleId={this.state.article.value ? this.state.article.value.id : null} isAllowedToPost={isAllowedToPost} onCommentPosted={this._addComment} />
				</div>
			</div>
		);
	}
}