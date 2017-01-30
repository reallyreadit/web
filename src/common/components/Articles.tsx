import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Article from '../api/models/Article';
import Fetchable from '../api/Fetchable';
import ArticleDetails from './ArticleDetails';
import ArticleList from './ArticleList';

export default class Articles extends ContextComponent<{}, { articles: Fetchable<Article[]> }> {
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listArticles(articles => this.setState({ articles }))
		};
	}
	public componentWillMount() {
		this.context.pageTitle.set('Hot Topics');
	}
	public render() {
		return (
			<div className="articles">
				<ArticleList>
					{this.state.articles.isLoading ?
						<li>Loading...</li> :
						this.state.articles.isSuccessful ?
							this.state.articles.value.length > 0 ?
								this.state.articles.value.map(article => <li key={article.id}><ArticleDetails {...article} /></li>) :
								<li>No articles found! (Go comment on one you read!)</li> :
							<li>Error loading articles.</li>}
				</ArticleList>
			</div>
		);
	}
}