import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import PageResult from '../../../../common/models/PageResult';
import ArticleList from '../controls/articles/ArticleList';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Fetchable from '../../../../common/Fetchable';
import produce from 'immer';
import LoadingOverlay from '../controls/LoadingOverlay';
import InfoBox from '../controls/InfoBox';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import ScreenContainer from '../ScreenContainer';
import ArticleLengthFilter from '../controls/ArticleLengthFilter';

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
}> {
	public render() {
		return (
			<ScreenContainer className="history-screen_lcny0g">
				{this.props.articles.isLoading ?
					<LoadingOverlay position="static" /> :
					this.props.isLoadingArticles || this.props.articles.value.items.length || this.props.minLength != null || this.props.maxLength != null ?
						<>
							<p>Your personal reading history is private.</p>
							<div className="controls">
								<ArticleLengthFilter
									max={this.props.maxLength}
									min={this.props.minLength}
									onChange={this.props.onLengthRangeChange}
								/>
							</div>
							{!this.props.isLoadingArticles ?
								<>
									<ArticleList>
										{this.props.articles.value.items.map(article =>
											<li key={article.id}>
												<ArticleDetails
													article={article}
													isUserSignedIn
													onCopyTextToClipboard={this.props.onCopyTextToClipboard}
													onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
													onRead={this.props.onReadArticle}
													onShare={this.props.onShare}
													onToggleStar={this.props.onToggleArticleStar}
													onViewComments={this.props.onViewComments}
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
								<LoadingOverlay position="static" />}
						</> :
						<InfoBox
							position="static"
							style="normal"
						>
							<>
								<p>You've read 0 articles.</p>
								<p><strong>Go read something!</strong></p>
							</>
						</InfoBox>}
			</ScreenContainer>
		);
	}
}