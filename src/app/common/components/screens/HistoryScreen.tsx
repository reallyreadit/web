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
export default class extends React.PureComponent<{
	articles: Fetchable<PageResult<UserArticle>>,
	isUserSignedIn: boolean,
	onDeleteArticle: (article: UserArticle) => void
	onLoadPage: (pageNumber: number) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}> {
	private readonly _deleteArticle = (article: UserArticle) => {
		if (window.confirm('Are you sure you want to delete this article?')) {
			this.props.onDeleteArticle(article);
		}
	};
	public render() {
		return (
			<div className="history-screen_lcny0g">
				{this.props.articles.isLoading ?
					<LoadingOverlay /> :
					this.props.articles.value.items.length ?
						<>
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
							</ArticleList>
							<PageSelector
								pageNumber={this.props.articles.value.pageNumber}
								pageCount={this.props.articles.value.pageCount}
								onChange={this.props.onLoadPage}
							/>
						</> :
						<div>
							You've read 0 articles.<br />
							<strong>Go read something!</strong>
						</div>}
			</div>
		);
	}
}