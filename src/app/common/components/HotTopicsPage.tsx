import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../serverApi/Fetchable';
import ArticleList from './controls/articles/ArticleList';
import PageSelector from './controls/PageSelector';
import Icon from '../../../common/components/Icon';
import ArticleDetails from '../../../common/components/ArticleDetails';
import PageResult from '../../../common/models/PageResult';

export default class extends React.PureComponent<{
	aotd: Fetchable<UserArticle>,
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
			<div className="hot-topics-page">
				<div className="hot-topics">
					{this.props.aotd.isLoading ?
						<span>Loading...</span> :
						this.props.aotd.errors ?
							<span>Error loading article of the day</span> :
							<div className="aotd">
								<h3>
									<Icon name="trophy" />Article of the Day<Icon name="trophy" />
								</h3>
								<ArticleDetails
									article={this.props.aotd.value}
									isUserSignedIn={this.props.isUserSignedIn}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShareArticle}
									onToggleStar={this.props.onToggleArticleStar}
									onViewComments={this.props.onViewComments}
								/>
								<hr />
							</div>}
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
				</div>
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