import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import PageResult from '../../../../common/models/PageResult';
import ArticleList from '../controls/articles/ArticleList';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Fetchable from '../../serverApi/Fetchable';
import produce from 'immer';
import LoadingOverlay from '../controls/LoadingOverlay';

interface State {
	articles: Fetchable<PageResult<UserArticle>>
}
export function updateArticles(this: React.Component<{}, State>, updatedArticle: UserArticle) {
	if (
		this.state.articles.value &&
		this.state.articles.value.items.some(article => article.id === updatedArticle.id)
	) {
		this.setState(produce<State>(prevState => {
			prevState.articles.value.items.forEach((article, index, articles) => {
				if (article.id === updatedArticle.id) {
					articles.splice(articles.indexOf(article), 1, updatedArticle);
				}
			});
		}));
	}
}
export default (props: {
	articles: Fetchable<PageResult<UserArticle>>,
	isUserSignedIn: boolean,
	onLoadPage: (pageNumber: number) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}) => (
	<div className="starred-screen_v6yb53">
		{props.articles.isLoading ?
			<LoadingOverlay /> :
			props.articles.value.items.length ?
				<>
					<ArticleList>
						{props.articles.value.items.map(article =>
							<li key={article.id}>
								<ArticleDetails
									article={article}
									isUserSignedIn={props.isUserSignedIn}
									onRead={props.onReadArticle}
									onShare={props.onShareArticle}
									onToggleStar={props.onToggleArticleStar}
									onViewComments={props.onViewComments}
								/>
							</li>
						)}
					</ArticleList>
					<PageSelector
						pageNumber={props.articles.value.pageNumber}
						pageCount={props.articles.value.pageCount}
						onChange={props.onLoadPage}
					/>
				</> :
				<div>
					Use stars to save articles for  later.<br />
					<strong>You have no starred articles.</strong>
				</div>}
	</div>
);