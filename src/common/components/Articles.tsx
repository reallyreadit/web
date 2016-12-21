import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Article from '../api/models/Article';
import Fetchable from '../api/Fetchable';

export default class List extends ContextComponent<{}, { articles: Fetchable<Article[]> }> {
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listArticles(articles => this.setState({ articles }))
		};
	}
	public refresh() {
		this.setState({
			articles: this.context.api.listArticles(articles => this.setState({ articles }))
		});
	}
	public componentWillMount() {
		this.context.pageTitle.set('Hot Topics');
	}
	public render() {
		return (
			<div className="articles">
				<ul>
				{this.state.articles.isLoading ?
					<li>Loading...</li> :
					this.state.articles.isSuccessful ?
						this.state.articles.value.map((article) =>
							<li key={article.id}>
								<span className="title">{article.title}</span><br />
								<span className="source">[{article.source}{article.author ? ` - ${article.author}` : ''}]</span>
								<span> - </span>
								<span className="comment-count">{`${article.commentCount} comment${article.commentCount !== 1 ? 's' : ''}`}</span>
							</li>) :
						<li>Error loading articles.</li>}
				</ul>
			</div>
		);
	}
}