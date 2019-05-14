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
import ArticleLengthFilter from '../controls/ArticleLengthFilter';
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
	articles: PageResult<UserArticle>,
	isLoadingArticles: boolean,
	onLengthRangeChange: (min: number, max: number) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onLoadPage: (pageNumber: number) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	maxLength: number | null,
	minLength: number | null
}) => (
	<div className="starred-screen_v6yb53">
		{props.isLoadingArticles || props.articles.items.length || props.minLength != null || props.maxLength != null ?
			<>
				<div className="controls">
					<ArticleLengthFilter
						max={props.maxLength}
						min={props.minLength}
						onChange={props.onLengthRangeChange}
					/>
				</div>
				{!props.isLoadingArticles ?
					<>
						<ArticleList>
							{props.articles.items.map(article =>
								<li key={article.id}>
									<ArticleDetails
										article={article}
										isUserSignedIn
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
					<LoadingOverlay position="static" />}
			</> :
			<InfoBox
				position="static"
				style="normal"
			>
				<p>You have 0 starred articles.</p>
				<p><strong>Star articles to save them for later.</strong></p>
			</InfoBox>}
	</div>
);