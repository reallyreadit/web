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
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import AsyncTracker from '../../../../common/AsyncTracker';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetUserArticleHistory: FetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isLoadingArticles: boolean,
	maxLength: number | null,
	minLength: number | null
}
class HistoryScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeLengthRange = (minLength: number | null, maxLength: number | null) => {
		this.setState({
			isLoadingArticles: true,
			minLength,
			maxLength
		});
		this.fetchArticles(1, minLength, maxLength);
	};
	private readonly _changePage = (pageNumber: number) => {
		this.setState({ isLoadingArticles: true });
		this.fetchArticles(pageNumber, this.state.minLength, this.state.maxLength);
	};
	constructor(props: Props) {
		super(props);
		const articles = this.fetchArticles(1, null, null);
		this.state = {
			articles,
			isLoadingArticles: articles.isLoading,
			maxLength: null,
			minLength: null
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				if (
					this.state.articles.value &&
					this.state.articles.value.items.some(article => article.id === event.article.id)
				) {
					this.setState(produce<State>(prevState => {
						prevState.articles.value.items.forEach((article, index, articles) => {
							if (article.id === event.article.id) {
								articles.splice(articles.indexOf(article), 1, event.article);
							}
						});
					}));
				}
			})
		);
	}
	private fetchArticles(pageNumber: number, minLength: number | null, maxLength: number | null) {
		return this.props.onGetUserArticleHistory(
			{ pageNumber, minLength, maxLength },
			this._asyncTracker.addCallback(articles => {
				this.setState({ articles, isLoadingArticles: false });
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="history-screen_lcny0g">
				{this.state.articles.isLoading ?
					<LoadingOverlay position="static" /> :
					this.state.isLoadingArticles || this.state.articles.value.items.length || this.state.minLength != null || this.state.maxLength != null ?
						<>
							<p>Your personal reading history is private.</p>
							<div className="controls">
								<ArticleLengthFilter
									max={this.state.maxLength}
									min={this.state.minLength}
									onChange={this._changeLengthRange}
								/>
							</div>
							{!this.state.isLoadingArticles ?
								<>
									<ArticleList>
										{this.state.articles.value.items.map(article =>
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
										pageNumber={this.state.articles.value.pageNumber}
										pageCount={this.state.articles.value.pageCount}
										onChange={this._changePage}
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
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Props
) {
	return {
		create: () => ({ key, title: 'History' }),
		render: () => (
			<HistoryScreen {...deps} />
		)
	};
}