import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../api/Fetchable';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';

export default class ReadingListPage extends ContextComponent<RouteComponentProps<{}>, { articles: Fetchable<UserArticle[]> }> {
	private _redirectToHomepage = () => this.context.router.history.push('/');
	private _deleteArticle = (article: UserArticle) => {
		const articles = this.state.articles.value.slice();
		articles.splice(articles.indexOf(article), 1);
		this.setState({ articles: { ...this.state.articles, value: articles }});
		this.context.api.deleteUserArticle(article.id);
	};
	private _loadArticles = () => this.context.api.listUserArticles(articles => this.setState({ articles }, () => this.context.page.setState({ isLoading: false })));
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this._loadArticles();
	};
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = { articles: this._loadArticles() };
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'Reading List',
			isLoading: this.state.articles.isLoading,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.user.addListener('signOut', this._redirectToHomepage);
		this.context.page.addListener('reload', this._reload);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('signOut', this._redirectToHomepage);
		this.context.page.removeListener('reload', this._reload);
	}
	public render() {
		return (
			<div className="reading-list-page">
				<ArticleList>
					{!this.state.articles.isLoading ?
						this.state.articles.value ?
							this.state.articles.value.length ?
								this.state.articles.value.map(article => <li key={article.id}><ArticleDetails article={article} showControls={true} onDelete={this._deleteArticle} /></li>) :
								<li>No articles found.</li> :
							<li>Error loading articles.</li> :
						<li>Loading...</li>}
				</ArticleList>
			</div>
		);
	}
}