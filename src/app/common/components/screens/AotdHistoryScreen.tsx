import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareData from '../../../../common/sharing/ShareData';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import Fetchable from '../../../../common/Fetchable';
import PageResult from '../../../../common/models/PageResult';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import ArticleList from '../controls/articles/ArticleList';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Rating from '../../../../common/models/Rating';
import ArticleQuery from '../../../../common/models/articles/ArticleQuery';
import ScreenContainer from '../ScreenContainer';
import UserAccount from '../../../../common/models/UserAccount';
import HeaderSelector from '../HeaderSelector';
import CommunityReadsQuery from '../../../../common/models/articles/CommunityReadsQuery';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';

enum List {
	Recent = 'Recent',
	BestEver = 'Best Ever'
}
export interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetAotdHistory: FetchFunctionWithParams<ArticleQuery, PageResult<UserArticle>>,
	onGetCommunityReads: FetchFunctionWithParams<CommunityReadsQuery, CommunityReads>,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	title?: string,
	user: UserAccount | null
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isScreenLoading: boolean,
	list: List,
	maxLength: number | null,
	minLength: number | null
}
export default class AotdHistoryScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeList = (value: string) => {
		const list = value as List;
		if (list !== this.state.list) {
			this.setState({
				articles: {
					isLoading: true
				},
				list
			});
			this.fetchArticles(list, 1, this.state.minLength, this.state.maxLength);
		}
	};
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			articles: {
				isLoading: true
			}
		});
		this.fetchArticles(this.state.list, pageNumber, this.state.minLength, this.state.maxLength);
	};
	private readonly _headerSelectorItems = [
		{
			value: List.Recent
		},
		{
			value: List.BestEver
		}
	];
	constructor(props: Props) {
		super(props);
		const
			list = List.Recent,
			minLength: number | null = null,
			maxLength: number | null = null,
			articles = this.fetchArticles(list, 1, minLength, maxLength);
		this.state = {
			articles: articles as Fetchable<PageResult<UserArticle>>,
			list,
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
		list: List,
		pageNumber: number,
		minLength: number | null,
		maxLength: number | null
	) {
		switch (list) {
			case List.Recent:
				return this.props.onGetAotdHistory(
					{
						maxLength,
						minLength,
						pageNumber
					},
					this._asyncTracker.addCallback(
						articles => {
							this.setState({
								articles,
								isScreenLoading: false
							});
						}
					)
				);
			case List.BestEver:
				return this.props.onGetCommunityReads(
					{
						maxLength,
						minLength,
						pageNumber,
						pageSize: 40,
						sort: CommunityReadSort.Top
					},
					this._asyncTracker.addCallback(
						communityReads => {
							this.setState({
								articles: {
									isLoading: false,
									value: communityReads.value.articles
								},
								isScreenLoading: false
							});
						}
					)
				);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="aotd-history-screen_lpelxe">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="static" /> :
					<>
						{this.props.title ?
							<h1>{this.props.title}</h1> :
							null}
						<div className="controls">
							<HeaderSelector
								disabled={this.state.articles.isLoading}
								items={this._headerSelectorItems}
								onChange={this._changeList}
								value={this.state.list}
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