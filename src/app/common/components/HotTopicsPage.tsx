import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Article from '../api/models/Article';
import Fetchable from '../api/Fetchable';
import ArticleDetails from './ArticleDetails';
import ArticleList from './ArticleList';
import Button from './Button';

export default class HotTopicsPage extends ContextComponent<{}, { articles: Fetchable<Article[]> }> {
	private _refresh = () => this.setState({ articles: this.context.api.listArticles(articles => this.setState({ articles })) });
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listArticles(articles => this.setState({ articles }))
		};
	}
	public componentWillMount() {
		this.context.pageTitle.set('Hot Topics');
	}
	public componentDidMount() {
		this.context.user
			.addListener('signIn', this._refresh)
			.addListener('signOut', this._refresh);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signIn', this._refresh)
			.removeListener('signOut', this._refresh);
	}
	public render() {
		return (
			<div className="hot-topics-page">
				<Button onClick={this._refresh} state={this.state.articles.isLoading ? 'disabled' : 'normal'}>Refresh</Button>
				<ArticleList>
					{this.state.articles.isLoading ?
						<li>Loading...</li> :
						this.state.articles.isSuccessful ?
							this.state.articles.value.length > 0 ?
								this.state.articles.value.map(article => <li key={article.id}><ArticleDetails article={article} /></li>) :
								<li>No articles found! (Go comment on one you read!)</li> :
							<li>Error loading articles.</li>}
				</ArticleList>
			</div>
		);
	}
}