import * as React from 'react';
import UserArticle from '../../../common/models/UserArticle';
import Fetchable from '../serverApi/Fetchable';
import ArticleList from './controls/articles/ArticleList';
import PageSelector from './controls/PageSelector';
import Icon from '../../../common/components/Icon';
import ArticleDetails from '../../../common/components/ArticleDetails';
import PageResult from '../../../common/models/PageResult';

export default (props: {
	aotd: Fetchable<UserArticle>,
	articles: Fetchable<PageResult<UserArticle>>,
	isUserSignedIn: boolean,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onReload: (pageNumber: number) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}) => (
	<div className="hot-topics-list">
		{props.aotd.value ?
			<div className="aotd">
				<h3>
					<Icon name="trophy" />Article of the Day<Icon name="trophy" />
				</h3>
				<ArticleDetails
					article={props.aotd.value}
					isUserSignedIn={props.isUserSignedIn}
					onRead={props.onReadArticle}
					onShare={props.onShareArticle}
					onToggleStar={props.onToggleArticleStar}
					onViewComments={props.onViewComments}
				/>
				<hr />
			</div>
			: null}
		{props.articles.value ?
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
			: null}
		<PageSelector
			pageNumber={props.articles.value ? props.articles.value.pageNumber : 1}
			pageCount={props.articles.value ? props.articles.value.pageCount : 1}
			onChange={props.onReload}
			disabled={props.articles.isLoading}
		/>
	</div>
);