import * as React from 'react';
import UserArticle from '../../../../../common/models/UserArticle';
import ArticleList from './ArticleList';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import PageResult from '../../../../../common/models/PageResult';
import Fetchable from '../../../serverApi/Fetchable';
import HotTopics from '../../../../../common/models/HotTopics';
import produce from 'immer';

interface State {
	hotTopics: Fetchable<HotTopics>
}
export function updateHotTopics(this: React.Component<{}, State>, updatedArticle: UserArticle, isCompletionCommit: boolean) {
	if (
		this.state.hotTopics.value &&
		(
			[this.state.hotTopics.value.aotd]
				.concat(this.state.hotTopics.value.articles.items)
				.some(article => article.id === updatedArticle.id) ||
			(!this.state.hotTopics.value.userStats && isCompletionCommit)
		)
	) {
		this.setState(produce<State>(prevState => {
			if (prevState.hotTopics.value.aotd.id === updatedArticle.id) {
				prevState.hotTopics.value.aotd = updatedArticle;
			}
			prevState.hotTopics.value.articles.items.forEach((article, index, articles) => {
				if (article.id === updatedArticle.id) {
					articles.splice(articles.indexOf(article), 1, updatedArticle);
				}
			});
			if (!prevState.hotTopics.value.userStats && isCompletionCommit) {
				// ugly hack to dismiss welcome info box
				prevState.hotTopics.value.userStats = {
					readCount: 1,
					readCountRank: 0,
					streak: null,
					streakRank: null,
					userCount: 0
				};
			}
		}));
	}
}
export default (props: {
	aotd: UserArticle,
	articles: PageResult<UserArticle>,
	isUserSignedIn: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}) => (
	<div className="hot-topics-list_4aaj4s">
		<h3>Article of the Day</h3>
		<ArticleDetails
			article={props.aotd}
			isUserSignedIn={props.isUserSignedIn}
			onCopyTextToClipboard={props.onCopyTextToClipboard}
			onRead={props.onReadArticle}
			onShare={props.onShareArticle}
			onToggleStar={props.onToggleArticleStar}
			onViewComments={props.onViewComments}
		/>
		<h3>Top Reads</h3>
		<ArticleList>
			{props.articles.items.map(article =>
				<li key={article.id}>
					<ArticleDetails
						article={article}
						isUserSignedIn={props.isUserSignedIn}
						onCopyTextToClipboard={props.onCopyTextToClipboard}
						onRead={props.onReadArticle}
						onShare={props.onShareArticle}
						onToggleStar={props.onToggleArticleStar}
						onViewComments={props.onViewComments}
					/>
				</li>
			)}
		</ArticleList>
	</div>
);