import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareData, { ShareChannelData } from '../../../../common/sharing/ShareData';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import Fetchable from '../../../../common/Fetchable';
import PageResult from '../../../../common/models/PageResult';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import List from '../controls/List';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Rating from '../../../../common/models/Rating';
import ScreenContainer from '../ScreenContainer';
import UserAccount from '../../../../common/models/UserAccount';
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';
import * as classNames from 'classnames';
import {DeviceType} from '../../../../common/DeviceType';
import { NavReference } from '../Root';

export interface Props {
	deviceType: DeviceType,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetPublisherArticles: FetchFunctionWithParams<PublisherArticleQuery, PageResult<UserArticle>>,
	onNavTo: (ref: NavReference) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
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
					<LoadingOverlay position="static" /> :
					<>
						<div className="controls">
							<h1 className={classNames({ 'has-title': !!this.props.title })}>{this.props.title}</h1>
						</div>
						{this.state.articles.isLoading ?
							<LoadingOverlay position="static" /> :
							<>
								<List>
									{this.state.articles.value.items.map(
										article => (
											<li key={article.id}>
												<ArticleDetails
													article={article}
													deviceType={this.props.deviceType}
													onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
													onNavTo={this.props.onNavTo}
													onPost={this.props.onPostArticle}
													onRateArticle={this.props.onRateArticle}
													onRead={this.props.onReadArticle}
													onShare={this.props.onShare}
													onShareViaChannel={this.props.onShareViaChannel}
													onToggleStar={this.props.onToggleArticleStar}
													onViewComments={this.props.onViewComments}
													onViewProfile={this.props.onViewProfile}
													user={this.props.user}
												/>
											</li>
										)
									)}
								</List>
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