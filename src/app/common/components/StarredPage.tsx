import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../serverApi/Fetchable';
import PageResult from '../../../common/models/PageResult';
import ArticleList from './controls/articles/ArticleList';
import PageSelector from './controls/PageSelector';
import ArticleDetails from '../../../common/components/ArticleDetails';

export default class extends React.PureComponent<{
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
										onRead={this.props.onReadArticle}
										onShare={this.props.onShareArticle}
										onToggleStar={this.props.onToggleArticleStar}
										onViewComments={this.props.onViewComments}
									/>
								</li>
							)}
						</ArticleList>}
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