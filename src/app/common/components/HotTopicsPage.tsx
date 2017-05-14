import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Article from '../api/models/Article';
import Fetchable from '../api/Fetchable';
import ArticleDetails from './ArticleDetails';
import ArticleList from './ArticleList';

export default class HotTopicsPage extends ContextComponent<{}, { articles: Fetchable<Article[]> }> {
	private _loadArticles = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.listArticles(articles => this.setState({ articles }, () => this.context.page.setState({ isLoading: false })));
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listArticles(articles => this.setState({ articles }, () => this.context.page.setState({ isLoading: false })))
		};
	}
	public componentWillMount() {
		this.context.page.setState({
			title: '🔥 Hot Topics 🔥',
			isLoading: this.state.articles.isLoading
		});
	}
	public componentDidMount() {
		this.context.user.addListener('authChange', this._loadArticles);
		this.context.page.addListener('reload', this._loadArticles);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._loadArticles);
		this.context.page.removeListener('reload', this._loadArticles);
	}
	public render() {
		return (
			<div className="hot-topics-page">
				<ArticleList>
					{!this.state.articles.isLoading ?
						this.state.articles.value ?
							this.state.articles.value.length ?
								this.state.articles.value.map(article => <li key={article.id}><ArticleDetails article={article} /></li>) :
								<li>No articles found! (Go comment on one you read!)</li> :
							<li>Error loading articles.</li> :
						null}
				</ArticleList>
			</div>
		);
	}
}