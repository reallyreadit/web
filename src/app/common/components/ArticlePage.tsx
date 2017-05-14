import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Fetchable from '../api/Fetchable';
import Article from '../api/models/Article';
import Comment from '../api/models/Comment';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';
import readingParameters from '../../../common/readingParameters';
import CommentList from './CommentList';
import CommentBox from './CommentBox';
import { State as PageState } from '../Page';

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
	private _reloadArticle = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.getArticleDetails(this._slug, article => this.setState({ article }, () => this.context.page.setState({ isLoading: false })));
	};
	private _addComment = (comment: Comment) => {
		const comments = this.state.comments.value.slice();
		comments.splice(Math.max(comments.findIndex(c => c.dateCreated < comment.dateCreated), 0), 0, comment);
		this.setState({ comments: { ...this.state.comments, value: comments }});
		this._reloadArticle();
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
	private _loadPage = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.getArticleDetails(this._slug, article => this.setState({ article }, this._updatePageState));
		this.context.api.listComments(this._slug, comments => this.setState({ comments }, this._updatePageState));
	};
	constructor(props: Props, context: Context) {
		super(props, context);
		this._slug = this.props.params.source + '_' + this.props.params.article;
		this.state = {
			article: this.context.api.getArticleDetails(this._slug, article => this.setState({ article }, this._updatePageState)),
			comments: this.context.api.listComments(this._slug, comments => this.setState({ comments }, this._updatePageState))
		};
	}
	public componentWillMount() {
		this.context.page.setState({
			title: this.state.article.isLoading ? 'Loading...' : this.state.article.value.title,
			isLoading: this.state.article.isLoading || this.state.comments.isLoading
		});
	}
	public componentDidMount() {
		this.context.user.addListener('authChange', this._loadPage);
		this.context.page.addListener('reload', this._loadPage);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._loadPage);
		this.context.page.removeListener('reload', this._loadPage);
	}
	public render() {
		const isAllowedToPost = this.state.article.value && this.context.user.isSignedIn() && this.state.article.value.percentComplete >= readingParameters.articleUnlockThreshold;
		return (
			<div className="article-page">
				<ArticleList>
					{!this.state.article.isLoading ?
						this.state.article.value ?
							<li><ArticleDetails article={this.state.article.value} /></li> :
							<li>Error loading article.</li> :
						null}
				</ArticleList>
				<h3>Comments</h3>
				{!this.state.comments.isLoading ?
					this.state.comments.value ?
						this.state.comments.value.length ?
							<CommentList comments={this.state.comments.value} mode="reply" isAllowedToPost={isAllowedToPost} onCommentAdded={this._reloadArticle} /> :
							<span>No comments found! (Post one!)</span> :
						<span>Error loading comments.</span> :
					null}
				<hr />
				<div className="comment-box-wrapper">
					<CommentBox articleId={this.state.article.value ? this.state.article.value.id : null} isAllowedToPost={isAllowedToPost} onCommentPosted={this._addComment} />
				</div>
			</div>
		);
	}
}