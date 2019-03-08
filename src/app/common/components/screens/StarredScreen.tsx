import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import PageResult from '../../../../common/models/PageResult';
import ArticleList from '../controls/articles/ArticleList';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import produce from 'immer';
import InfoBox from '../controls/InfoBox';
import Fetchable from '../../../../common/Fetchable';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';

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
	articles: PageResult<UserArticle>,
	isUserSignedIn: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onLoadPage: (pageNumber: number) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}) => (
	<div className="starred-screen_v6yb53">
		{props.articles.items.length ?
			<>
				<ArticleList>
					{props.articles.items.map(article =>
						<li key={article.id}>
							<ArticleDetails
								article={article}
								isUserSignedIn={props.isUserSignedIn}
								onCopyTextToClipboard={props.onCopyTextToClipboard}
								onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
								onRead={props.onReadArticle}
								onShare={props.onShare}
								onToggleStar={props.onToggleArticleStar}
								onViewComments={props.onViewComments}
							/>
						</li>
					)}
				</ArticleList>
				<PageSelector
					pageNumber={props.articles.pageNumber}
					pageCount={props.articles.pageCount}
					onChange={props.onLoadPage}
				/>
			</> :
			<InfoBox
				position="absolute"
				style="normal"
			>
				{props.isUserSignedIn ?
					<>
						<p>You have 0 starred articles.</p>
						<p><strong>Star articles to save them for later.</strong></p>
					</> :
					<p>Sign up to save articles to your starred list.</p>}
			</InfoBox>}
	</div>
);