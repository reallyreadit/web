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
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onDeleteArticle: (article: UserArticle) => void
	onLoadPage: (pageNumber: number) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
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
			<ScreenContainer>
				<div className="history-screen_lcny0g">
					{this.props.articles.isLoading ?
						<LoadingOverlay /> :
						this.props.articles.value.items.length ?
							<>
								<p>Note: Your personal reading history is private.</p>
								<ArticleList>
									{this.props.articles.value.items.map(article =>
										<li key={article.id}>
											<ArticleDetails
												article={article}
												isUserSignedIn={this.props.isUserSignedIn}
												onCopyTextToClipboard={this.props.onCopyTextToClipboard}
												onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
												onDelete={this._deleteArticle}
												onRead={this.props.onReadArticle}
												onShare={this.props.onShare}
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
							<InfoBox
								position="absolute"
								style="normal"
							>
								{this.props.isUserSignedIn ?
									<>
										<p>You've read 0 articles.</p>
										<p><strong>Go read something!</strong></p>
									</> :
									<p>Sign up to track and improve your reading.</p>}
							</InfoBox>}
				</div>
			</ScreenContainer>
		);
	}
}