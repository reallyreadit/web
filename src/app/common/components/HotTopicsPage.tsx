import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import UserArticle from '../../../common/models/UserArticle';
import HotTopics from '../../../common/models/HotTopics';
import Fetchable from '../api/Fetchable';
import ArticleDetails from './controls/articles/ArticleDetails';
import ArticleList from './controls/articles/ArticleList';
import PageSelector from './controls/PageSelector';
import Icon from '../../../common/components/Icon';

export default class HotTopicsPage extends React.Component<RouteComponentProps<{}>, { hotTopics: Fetchable<HotTopics> }> {
	public static contextTypes = contextTypes;
	public context: Context;
	private _loadHotTopics = () => this.context.api.listHotTopics(
		this.getCurrentPage(),
		hotTopics => {
			this.setState({ hotTopics });
			this.context.page.setState({ isLoading: false });
		}
	);
	private _reload = () => {
		this.context.page.setState({ isLoading: true });
		this._loadHotTopics();
	};
	private _updatePageNumber = (pageNumber: number) => {
		this.setState(
			{
				hotTopics: {
					...this.state.hotTopics,
					value: {
						...this.state.hotTopics.value,
						articles: {
							...this.state.hotTopics.value.articles,
							pageNumber
						}
					},
					isLoading: true
				}
			},
			this._loadHotTopics
		);
		this.context.page.setState({ isLoading: true });
	};
	private _updateArticle = (article: UserArticle) => {
		if (article.id === this.state.hotTopics.value.aotd.id) {
			this.setState({
				hotTopics: {
					...this.state.hotTopics,
					value: {
						...this.state.hotTopics.value,
						aotd: article
					}
				}
			});
		} else {
			const articleIndex = this.state.hotTopics.value.articles.items.findIndex(a => a.id === article.id);
			if (articleIndex !== -1) {
				const items = this.state.hotTopics.value.articles.items.slice();
				items.splice(articleIndex, 1, article);
				this.setState({
					hotTopics: {
						...this.state.hotTopics,
						value: {
							...this.state.hotTopics.value,
							articles: {
								...this.state.hotTopics.value.articles,
								items
							}
						}
					}
				});
			}
		}
	};
	private _updateArticleFromEnvironment = (data: { article: UserArticle, isCompletionCommit: boolean }) => {
		this._updateArticle(data.article);
	};
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = { hotTopics: this._loadHotTopics() };
	}
	private getCurrentPage() {
		return (this.state && this.state.hotTopics && this.state.hotTopics.value && this.state.hotTopics.value.articles.pageNumber) || 1;
	}
	public componentWillMount() {
		this.context.page.setState({
			title: 'What We\'re Reading',
			isLoading: this.state.hotTopics.isLoading,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.user.addListener('authChange', this._reload);
		this.context.page.addListener('reload', this._reload);
		this.context.environment.addListener('articleUpdated', this._updateArticleFromEnvironment);
	}
	public componentWillUnmount() {
		this.context.user.removeListener('authChange', this._reload);
		this.context.page.removeListener('reload', this._reload);
		this.context.environment.removeListener('articleUpdated', this._updateArticleFromEnvironment);
	}
	public render() {
		return (
			<div className="hot-topics-page">
				{!this.state.hotTopics.isLoading ?
					this.state.hotTopics.value ?
						<div className="hot-topics">
							<div className="aotd">
								<h3><Icon name="trophy" />Article of the Day<Icon name="trophy" /></h3>
								{this.state.hotTopics.value.aotd ?
									<ArticleDetails
										article={this.state.hotTopics.value.aotd}
										isUserSignedIn={this.context.user.isSignedIn}
										onChange={this._updateArticle}
									/> :
									<span>No article of the day found!</span>}
							</div>
							{this.state.hotTopics.value.articles.items.length ?
								<ArticleList>
									{this.state.hotTopics.value.articles.items.map(article =>
										<li key={article.id}>
											<ArticleDetails
												article={article}
												isUserSignedIn={this.context.user.isSignedIn}
												onChange={this._updateArticle}
											/>
										</li>
									)}
								</ArticleList> :
								<span>No articles found.</span>}
						</div> :
						<span>Error loading articles.</span> :
					<span>Loading...</span>}
				<PageSelector
					pageNumber={this.getCurrentPage()}
					pageCount={this.state.hotTopics.value ? this.state.hotTopics.value.articles.pageCount : 1}
					onChange={this._updatePageNumber}
					disabled={this.state.hotTopics.isLoading}
				/>
			</div>
		);
	}
}