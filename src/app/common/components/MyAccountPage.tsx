import * as React from 'react';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Article from '../api/models/Article';
import Fetchable from '../api/Fetchable';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';
import Button from './Button';

export default class MyAccountPage extends ContextComponent<{}, { articles: Fetchable<Article[]> }> {
	private _redirectToHomepage = () => this.context.router.push('/');
	private _refresh = () => this.setState({ articles: this.context.api.listUserArticles(articles => this.setState({ articles })) });
	private _deleteArticle = (article: Article) => {
		const articles = this.state.articles.value.slice();
		articles.splice(articles.indexOf(article), 1);
		this.setState({ articles: { ...this.state.articles, value: articles }});
		this.context.api.deleteUserArticle(article.id);
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			articles: this.context.api.listUserArticles(articles => this.setState({ articles }))
		};
	}
	public componentWillMount() {
		this.context.pageTitle.set('My Account');
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
	}
	public render() {
		return (
			<div className="my-account-page">
				<h3>My Articles <Button onClick={this._refresh} state={this.state.articles.isLoading ? 'disabled' : 'normal'}>Refresh</Button></h3>
				<ArticleList>
					{this.state.articles.isLoading ?
						<li>Loading...</li> :
						this.state.articles.isSuccessful ?
							this.state.articles.value.length > 0 ?
								this.state.articles.value.map(article => <li key={article.id}><ArticleDetails article={article} showControls={true} onDelete={this._deleteArticle} /></li>) :
								<li>No articles found! (Go read one!)</li> :
							<li>Error loading articles for user.</li>}
				</ArticleList>
			</div>
		);
	}
}