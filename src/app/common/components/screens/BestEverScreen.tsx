import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import Fetchable from '../../../../common/Fetchable';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import List from '../controls/List';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Rating from '../../../../common/models/Rating';
import ScreenContainer from '../ScreenContainer';
import UserAccount from '../../../../common/models/UserAccount';
import CommunityReadsQuery from '../../../../common/models/articles/CommunityReadsQuery';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import { Screen, NavOptions, NavReference, SharedState } from '../Root';
import {DeviceType} from '../../../../common/DeviceType';
import MarketingBanner from '../BrowserRoot/MarketingBanner';
import {variants} from '../../marketingTesting';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

export interface Props {
	deviceType: DeviceType,
	location: RouteLocation,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<CommunityReadsQuery, CommunityReads>,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	title?: string,
	user: UserAccount | null
}
interface State {
	communityReads: Fetchable<CommunityReads>,
	isScreenLoading: boolean,
	maxLength: number | null,
	minLength: number | null
}
export class BestEverScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			communityReads: {
				isLoading: true
			}
		});
		this.fetchArticles(pageNumber, this.state.minLength, this.state.maxLength);
	};
	constructor(props: Props) {
		super(props);
		const
			minLength: number | null = null,
			maxLength: number | null = null,
			communityReads = this.fetchArticles(1, minLength, maxLength);
		this.state = {
			communityReads: communityReads as Fetchable<CommunityReads>,
			isScreenLoading: communityReads.isLoading,
			maxLength,
			minLength
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.state.communityReads.value &&
						this.state.communityReads.value.articles.items.some(article => article.id === event.article.id)
					) {
						this.setState(produce((prevState: State) => {
							prevState.communityReads.value.articles.items.forEach((article, index, articles) => {
								if (article.id === event.article.id) {
									// merge objects in case the new object is missing properties due to outdated iOS client
									articles.splice(
										articles.indexOf(article),
										1,
										{
											...article,
											...event.article,
											dateStarred: event.article.dateStarred
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
		maxLength: number | null
	) {
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
						communityReads,
						isScreenLoading: false
					});
				}
			)
		);

	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="best-ever-screen_bmdeo1">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="static" /> :
					<>
						{!this.props.user ?
							<MarketingBanner
							analyticsAction="CommentsScreen"
							deviceType={this.props.deviceType}
							marketingVariant={variants[0]}
							location={this.props.location}
							onNavTo={this.props.onNavTo}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
							onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
						/> : null}
						{this.props.title ?
							<h1>{this.props.title}</h1> :
							null}
						{this.state.communityReads.isLoading ?
							<LoadingOverlay position="static" /> :
							<>
								<List>
									{this.state.communityReads.value.articles.items.map(
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
									pageNumber={this.state.communityReads.value.articles.pageNumber}
									pageCount={this.state.communityReads.value.articles.pageCount}
									onChange={this._changePageNumber}
								/>
							</>}
					</>}
			</ScreenContainer>
		);
	}
}


export default function createBestEverScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'location' | 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Top of all time' }),
		render: (state: Screen, sharedState: SharedState) => (
			<BestEverScreen
				{
					...{
						...deps,
						location: state.location,
						user: sharedState.user
					}
				}
			/>
		)
	};
}