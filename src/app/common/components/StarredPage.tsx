import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../serverApi/Fetchable';
import PageResult from '../../../common/models/PageResult';
import ArticleList from './controls/articles/ArticleList';
import PageSelector from './controls/PageSelector';
import ArticleDetails from '../../../common/components/ArticleDetails';
import UserAccount from '../../../common/models/UserAccount';
import { Screen } from './Root';
import LoadingOverlay from './controls/LoadingOverlay';

export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: {
	onGetStarredArticles: (pageNumber: number, callback: (articles: Fetchable<PageResult<UserArticle>>) => void) => Fetchable<PageResult<UserArticle>>,
	onGetUser: () => UserAccount | null,
	onReadArticle: (article: UserArticle, ev: React.MouseEvent) => void,
	onSetScreenState: (key: TScreenKey, state: Partial<Screen>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}) {
	const getArticles = (pageNumber: number) => deps.onGetStarredArticles(
		pageNumber,
		articles => deps.onSetScreenState(key, { articleLists: { ['articles']: articles } })
	);
	const reload = (pageNumber: number) => deps.onSetScreenState(key, {
		articleLists: {
			['articles']: getArticles(pageNumber)
		}
	});
	return {
		create: () => ({
			articleLists: {
				['articles']: getArticles(1)
			},
			key,
			title: 'Starred'
		}),
		render: (state: Screen) => (
			state.articleLists['articles'].isLoading ?
				<LoadingOverlay /> :
				<StarredPage
					articles={state.articleLists['articles']}
					isUserSignedIn={!!deps.onGetUser()}
					onReadArticle={deps.onReadArticle}
					onReload={reload}
					onShareArticle={deps.onShareArticle}
					onToggleArticleStar={deps.onToggleArticleStar}
					onViewComments={deps.onViewComments}
				/>
		)
	};
}
export default class StarredPage extends React.PureComponent<{
	articles: Fetchable<PageResult<UserArticle>>,
	isUserSignedIn: boolean,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onReload: (pageNumber: number) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}, {}> {
	public render() {
		return (
			<div className="starred-page">
				{this.props.articles.value ?
					<ArticleList>
						{this.props.articles.value.items.map(article =>
							<li key={article.id}>
								<ArticleDetails
									article={article}
									isUserSignedIn={this.props.isUserSignedIn}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShareArticle}
									onToggleStar={this.props.onToggleArticleStar}
									onViewComments={this.props.onViewComments}
								/>
							</li>
						)}
					</ArticleList> :
					null}
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