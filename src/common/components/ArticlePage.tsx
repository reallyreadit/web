import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Fetchable from '../api/Fetchable';
import Article from '../api/models/Article';
import Comment from '../api/models/Comment';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';
import Button from './Button';

interface Props {
	params: {
		source: string,
		article: string,
	}
}
export default class ArticlePage extends ContextComponent<Props, {
	article: Fetchable<Article>,
	comments: Fetchable<Comment[]>,
	commentText?: string
}> {
	private _slug: string;
	private _updateCommentText = (event: React.FormEvent<HTMLTextAreaElement>) =>
		this.state.commentText = (event.target as HTMLTextAreaElement).value;
	private _postComment = () =>
		this.context.api
			.postComment(this.state.commentText, this.state.article.value.id)
			.then(() => this.setState({
				comments: this.context.api.listComments(this._slug, comments => this.setState({ comments })),
				commentText: ''
			}));
	constructor(props: Props, context: Context) {
		super(props, context);
		this._slug = this.props.params.source + '_' + this.props.params.article;
		this.state = {
			article: this.context.api.getArticleDetails(this._slug, article => {
				this.setState({ article }, () => this.setPageTitle())
			}),
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
	public render() {
		return (
			<div className="article-page">
				<ArticleList>
					{this.state.article.isLoading ?
						<li>Loading...</li> :
						this.state.article.isSuccessful ?
							<li><ArticleDetails {...this.state.article.value} /></li> :
							<li>Error loading article.</li>}
				</ArticleList>
				<h3>Comments</h3>
				<ul className="comment-list">
					{this.state.comments.isLoading ?
						<li>Loading...</li> :
						this.state.comments.isSuccessful ?
							this.state.comments.value.length ?
								this.state.comments.value.map(comment =>
									<li key={comment.id}>
										<span className="title">Posted by <strong>{comment.userAccount}</strong> on {comment.dateCreated}</span>
										<span className="text">{comment.text}</span>
									</li>
								) :
								<li>No comments found! (Post one!)</li> :
							<li>Error loading comments.</li>}
				</ul>
				<hr />
				<textarea value={this.state.commentText} onChange={this._updateCommentText} />
				<br />
				<Button style="preferred" onClick={this._postComment}>Post Comment</Button>
			</div>
		);
	}
}