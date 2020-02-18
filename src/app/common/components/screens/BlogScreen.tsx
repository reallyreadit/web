import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareData from '../../../../common/sharing/ShareData';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import Fetchable from '../../../../common/Fetchable';
import PageResult from '../../../../common/models/PageResult';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import ArticleLengthFilter from '../controls/ArticleLengthFilter';
import ArticleList from '../controls/articles/ArticleList';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Rating from '../../../../common/models/Rating';
import ScreenContainer from '../ScreenContainer';
import UserAccount from '../../../../common/models/UserAccount';
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';

export interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetPublisherArticles: FetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	title?: string,
	user: UserAccount | null
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isScreenLoading: boolean,
	maxLength: number | null,
	minLength: number | null
}
export default class BlogScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeLengthRange = (minLength: number | null, maxLength: number | null) => {
		this.setState({
			articles: { isLoading: true },
			minLength,
			maxLength
		});
		this.fetchArticles(1, minLength, maxLength);
	};
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			articles: { isLoading: true }
		});
		this.fetchArticles(pageNumber, this.state.minLength, this.state.maxLength);
	};
	constructor(props: Props) {
		super(props);
		const
			minLength: number | null = null,
			maxLength: number | null = null,
			articles = this.fetchArticles(
				1,
				minLength,
				maxLength,
				() => {
					this.setState({
						isScreenLoading: false
					});
				}
			);
		this.state = {
			articles,
			isScreenLoading: articles.isLoading,
			maxLength,
			minLength
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.state.articles.value &&
						this.state.articles.value.items.some(article => article.id === event.article.id)
					) {
						this.setState(produce((prevState: State) => {
							prevState.articles.value.items.forEach((article, index, articles) => {
								if (article.id === event.article.id) {
									// merge objects in case the new object is missing properties due to outdated iOS client
									articles.splice(
										articles.indexOf(article),
										1,
										{
											...article,
											...event.article
										}
									);
								}
							});
						}));
					}
				}
			)
		);
	}
	private fetchArticles(
		pageNumber: number,
		minLength: number | null,
		maxLength: number | null,
		callback?: () => void
	) {
		return this.props.onGetPublisherArticles(
			{
				slug: 'blogreadupcom',
				pageSize: 40,
				pageNumber,
				minLength,
				maxLength
			},
			this._asyncTracker.addCallback(
				articles => {
					this.setState({ articles });
					if (callback) {
						callback();
					}
				}
			)
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="blog-screen_61pk1b">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="absolute" /> :
					<>
						<div className="controls">
							{this.props.title ?
								<h1>{this.props.title}</h1> :
								null}
							<ArticleLengthFilter
								max={this.state.maxLength}
								min={this.state.minLength}
								onChange={this._changeLengthRange}
							/>
						</div>
						{this.state.articles.isLoading ?
							<LoadingOverlay position="static" /> :
							<>
								<ArticleList>
									{this.state.articles.value.items.map(
										article => (
											<li key={article.id}>
												<ArticleDetails
													article={article}
													onCopyTextToClipboard={this.props.onCopyTextToClipboard}
													onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
													onPost={this.props.onPostArticle}
													onRateArticle={this.props.onRateArticle}
													onRead={this.props.onReadArticle}
													onShare={this.props.onShare}
													onToggleStar={this.props.onToggleArticleStar}
													onViewComments={this.props.onViewComments}
													onViewProfile={this.props.onViewProfile}
													user={this.props.user}
												/>
											</li>
										)
									)}
								</ArticleList>
								<PageSelector
									pageNumber={this.state.articles.value.pageNumber}
									pageCount={this.state.articles.value.pageCount}
									onChange={this._changePageNumber}
								/>
							</>}
					</>}
			</ScreenContainer>
		);
	}
}