import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../serverApi/Fetchable';
import PageResult from '../../../common/models/PageResult';
import ArticleList from './controls/articles/ArticleList';
import ArticleDetails from '../../../common/components/ArticleDetails';
import PageSelector from './controls/PageSelector';
import UserAccount from '../../../common/models/UserAccount';
import { Screen } from './Root';

export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: {
	onDeleteArticle: (article: UserArticle) => void
	onGetUserArticleHistory: (pageNumber: number, callback: (articles: Fetchable<PageResult<UserArticle>>) => void) => Fetchable<PageResult<UserArticle>>,
	onGetUser: () => UserAccount | null,
	onGetScreenState: (key: TScreenKey) => Screen,
	onReadArticle: (article: UserArticle) => void,
	onSetScreenState: (key: TScreenKey, state: Partial<Screen>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}) {
	function getArticles(pageNumber: number) {
		return deps.onGetUserArticleHistory(
			pageNumber,
			articles => deps.onSetScreenState(key, { articleLists: { ['articles']: articles } })
		);
	}
	const reload = (pageNumber: number) => {
		deps.onSetScreenState(key, {
			articleLists: {
				['articles']: getArticles(pageNumber)
			}
		});
	};
	return {
		create: () => ({
			key,
			articleLists: {
				['articles']: getArticles(1)
			}
		}),
		render: () => (
			<HistoryPage
				articles={deps.onGetScreenState(key).articleLists['articles']}
				isUserSignedIn={!!deps.onGetUser()}
				onDeleteArticle={deps.onDeleteArticle}
				onReadArticle={deps.onReadArticle}
				onReload={reload}
				onShareArticle={deps.onShareArticle}
				onToggleArticleStar={deps.onToggleArticleStar}
				onViewComments={deps.onViewComments}
			/>
		)
	};
}
export default class HistoryPage extends React.PureComponent<{
	articles: Fetchable<PageResult<UserArticle>>,
	isUserSignedIn: boolean,
	onDeleteArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onReload: (pageNumber: number) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}, {}> {
	private _deleteArticle = (article: UserArticle) => {
		if (window.confirm('Are you sure you want to delete this article?')) {
			this.props.onDeleteArticle(article);
		}
	};
	public render() {
		return (
			<div className="history-page">
				<ArticleList>
					{this.props.articles.isLoading ?
						<span>Loading...</span> :
						this.props.articles.errors ?
							<span>Error loading articles</span> :
							<ArticleList>
								{this.props.articles.value.items.map(article =>
									<li key={article.id}>
										<ArticleDetails
											article={article}
											isUserSignedIn={this.props.isUserSignedIn}
											onDelete={this._deleteArticle}
											onRead={this.props.onReadArticle}
											onShare={this.props.onShareArticle}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
											showDeleteControl
										/>
									</li>
								)}
							</ArticleList>}
				</ArticleList>
				<PageSelector
					pageNumber={this.props.articles.value ? this.props.articles.value.pageNumber : 1}
					pageCount={this.props.articles.value ? this.props.articles.value.pageCount : 1}
					onChange={this.props.onReload}
					disabled={this.props.articles.isLoading}
				/>
			</div>
		);
	}
}