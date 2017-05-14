import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Article from '../api/models/Article';
import Fetchable from '../api/Fetchable';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';

export default class ReadingListPage extends ContextComponent<{}, { articles: Fetchable<Article[]> }> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _deleteArticle = (article: Article) => {
		const articles = this.state.articles.value.slice();
		articles.splice(articles.indexOf(article), 1);
		this.setState({ articles: { ...this.state.articles, value: articles }});
		this.context.api.deleteUserArticle(article.id);
	};
	private _loadArticles = () => {
		this.context.page.setState({ isLoading: true });
		this.context.api.listUserArticles(articles => this.setState({ articles }, () => this.context.page.setState({ isLoading: false })));
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listUserArticles(articles => this.setState({ articles }, () => this.context.page.setState({ isLoading: false })))
		};
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'Reading List',
			isLoading: this.state.articles.isLoading
		});
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
		this.context.page.addListener('reload', this._loadArticles);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
		this.context.page.removeListener('reload', this._loadArticles);
	}
	public render() {
		return (
			<div className="reading-list-page">
				<ArticleList>
					{!this.state.articles.isLoading ?
						this.state.articles.value ?
							this.state.articles.value.length ?
								this.state.articles.value.map(article => <li key={article.id}><ArticleDetails article={article} showControls={true} onDelete={this._deleteArticle} /></li>) :
								<li>No articles found! (Go read one!)</li> :
							<li>Error loading articles for user.</li> :
						null}
				</ArticleList>
			</div>
		);
	}
}