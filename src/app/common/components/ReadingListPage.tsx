import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../api/Fetchable';
import PageResult from '../../../common/models/PageResult';
import ArticleList from './ArticleList';
import ArticleDetails from './ArticleDetails';
import PageSelector from './PageSelector';
import Button from '../../../common/components/Button';

export default class ReadingListPage extends ContextComponent<RouteComponentProps<{}>, {
	view: 'starred' | 'history',
	articles: Fetchable<PageResult<UserArticle>>
}> {
	private _redirectToHomepage = () => this.context.router.history.push('/');
	private _loadArticles = () => {
		if (((this.state && this.state.view) || 'starred') === 'starred') {
			return this.context.api.listStarredArticles(
				this.getCurrentPage(),
				articles => {
					this.setState({ articles });
					this.context.page.setState({ isLoading: false })
				}
			);
		} else {
			return this.context.api.listUserArticleHistory(
				this.getCurrentPage(),
				articles => {
					this.setState({ articles });
					this.context.page.setState({ isLoading: false })
				}
			);
		}
	};
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this._loadArticles();
	};
	private _viewStarred = () => this.setView('starred');
	private _viewHistory = () => this.setView('history');
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
		if (article.dateStarred || article.dateCreated) {
			const items = this.state.articles.value.items.slice();
			items.splice(items.findIndex(a => a.id === article.id), 1, article);
			this.setState({
				articles: {
					...this.state.articles,
					value: { ...this.state.articles.value, items }
				}
			});
		} else {
			this.removeArticle(article.id);
		}
	};
	private _deleteArticle = (article: UserArticle) => {
		this.context.api.deleteUserArticle(article.id);
		this.removeArticle(article.id);
	};
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = {
			view: 'starred',
			articles: this._loadArticles()
		};
	}
	private getCurrentPage() {
		return (this.state && this.state.articles && this.state.articles.value && this.state.articles.value.pageNumber) || 1;
	}
	private setView(view: 'starred' | 'history') {
		this.setState(
			{
				view,
				articles: {
					...this.state.articles,
					value: { ...this.state.articles.value, pageNumber: 1 },
					isLoading: true
				}
			},
			this._loadArticles
		);
		this.context.page.setState({ isLoading: true });
	}
	private removeArticle(articleId: string) {
		const items = this.state.articles.value.items.slice();
		items.splice(items.findIndex(a => a.id === articleId), 1);
		this.setState({
			articles: {
				...this.state.articles,
				value: { ...this.state.articles.value, items }
			}
		});
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
				<div className="button-bar">
					<Button
						iconLeft="star"
						text="Starred"
						state={this.state.view === 'starred' ? 'active' : 'normal'}
						onClick={this._viewStarred}
					/>
					<Button
						iconLeft="clock"
						text="History"
						state={this.state.view === 'history' ? 'active' : 'normal'}
						onClick={this._viewHistory}
					/>
				</div>
				<ArticleList>
					{!this.state.articles.isLoading ?
						this.state.articles.value ?
							this.state.articles.value.items.length ?
								this.state.articles.value.items.map(article =>
									<li key={article.id}>
										<ArticleDetails
											article={article}
											showStarControl={true}
											showDeleteControl={true}
											onChange={this._updateArticle}
											onDelete={this._deleteArticle}
										/>
									</li>
								) :
								<li>No articles found. Click on the star next to an article to add it to this list.</li> :
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