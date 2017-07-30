import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import UserArticle from '../../../common/models/UserArticle';
import PageResult from '../../../common/models/PageResult';
import Fetchable from '../api/Fetchable';
import ArticleDetails from './ArticleDetails';
import ArticleList from './ArticleList';
import PageSelector from './PageSelector';

export default class HotTopicsPage extends ContextComponent<RouteComponentProps<{}>, { articles: Fetchable<PageResult<UserArticle>> }> {
	private _loadArticles = () => this.context.api.listHotTopics(
		this.getCurrentPage(),
		articles => {
			this.setState({ articles });
			this.context.page.setState({ isLoading: false });
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
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = { articles: this._loadArticles() };
	}
	private getCurrentPage() {
		return (this.state && this.state.articles && this.state.articles.value && this.state.articles.value.pageNumber) || 1;
	}
	public componentWillMount() {
		this.context.page.setState({
			title: '🔥 Hot Topics 🔥',
			isLoading: this.state.articles.isLoading,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.user.addListener('authChange', this._reload);
		this.context.page.addListener('reload', this._reload);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._reload);
		this.context.page.removeListener('reload', this._reload);
	}
	public render() {
		return (
			<div className="hot-topics-page">
				<ArticleList>
					{!this.state.articles.isLoading ?
						this.state.articles.value ?
							this.state.articles.value.items.length ?
								this.state.articles.value.items.map(article =>
									<li key={article.id}>
										<ArticleDetails article={article} showControls={this.context.user.isSignedIn} onChange={this._updateArticle} />
									</li>
								) :
								<li>No articles found.</li> :
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