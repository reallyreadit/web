import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Article from '../api/models/Article';
import Fetchable from '../api/Fetchable';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';

export default class MyAccount extends ContextComponent<{}, { articles: Fetchable<Article[]> }> {
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listUserArticles(articles => this.setState({ articles }))
		};
	}
	public refresh() {
		this.setState({
			articles: this.context.api.listUserArticles(articles => this.setState({ articles }))
		});
	}
	public componentWillMount() {
		this.context.pageTitle.set('My Account');
	}
	public render() {
		return (
			<div className="my-account">
				<h3>My Articles</h3>
				<ArticleList>
					{this.state.articles.isLoading ?
						<li>Loading...</li> :
						this.state.articles.isSuccessful ?
							this.state.articles.value.length > 0 ?
								this.state.articles.value.map(article => <li key={article.id}><ArticleDetails {...article} /></li>) :
								<li>No articles found! (Go read one!)</li> :
							<li>Error loading articles for user.</li>}
				</ArticleList>
			</div>
		);
	}
}