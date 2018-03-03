import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../api/Fetchable';
import PageResult from '../../../common/models/PageResult';
import ArticleList from './controls/articles/ArticleList';
import ArticleDetails from './controls/articles/ArticleDetails';
import PageSelector from './controls/PageSelector';

export default class extends React.Component<RouteComponentProps<{}>, { articles: Fetchable<PageResult<UserArticle>> }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _redirectToHomepage = () => this.context.router.history.push('/');
	private _loadArticles = () => this.context.api.listUserArticleHistory(
		this.getCurrentPage(),
		articles => {
			this.setState({ articles });
			this.context.page.setState({ isLoading: false })
		}
	);
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this._loadArticles();
	};
	private _updatePageNumber = (pageNumber: number) => {
		this.setState(
			{
				articles: {
					...this.state.articles,
					value: { ...this.state.articles.value, pageNumber },
					isLoading: true
				}
			},
			this._loadArticles
		);
		this.context.page.setState({ isLoading: true });
	};
	private _updateArticle = (article: UserArticle) => {
		const items = this.state.articles.value.items.slice();
		items.splice(items.findIndex(a => a.id === article.id), 1, article);
		this.setState({
			articles: {
				...this.state.articles,
				value: { ...this.state.articles.value, items }
			}
		});
	};
	private _deleteArticle = (article: UserArticle) => {
		this.context.api.deleteUserArticle(article.id);
		const items = this.state.articles.value.items.slice();
		items.splice(items.findIndex(a => a.id === article.id), 1);
		this.setState({
			articles: {
				...this.state.articles,
				value: { ...this.state.articles.value, items }
			}
		});
	};
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = { articles: this._loadArticles() };
	}
	private getCurrentPage() {
		return (this.state && this.state.articles && this.state.articles.value && this.state.articles.value.pageNumber) || 1;
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'History',
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
			<div className="history-page">
				<ArticleList>
					{!this.state.articles.isLoading ?
						this.state.articles.value ?
							this.state.articles.value.items.length ?
								this.state.articles.value.items.map(article =>
									<li key={article.id}>
										<ArticleDetails
											article={article}
											isUserSignedIn={true}
											showDeleteControl={true}
											onChange={this._updateArticle}
											onDelete={this._deleteArticle}
										/>
									</li>
								) :
								<li>No articles found. When you read an article it will show up here.</li> :
							<li>Error loading articles.</li> :
						<li>Loading...</li>}
				</ArticleList>
				<PageSelector
					pageNumber={this.getCurrentPage()}
					pageCount={this.state.articles.value ? this.state.articles.value.pageCount : 1}
					onChange={this._updatePageNumber}
					disabled={this.state.articles.isLoading}
				/>
			</div>
		);
	}
}