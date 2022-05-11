import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, SharedState, NavReference, NavOptions } from '../Root';
import AsyncLink from '../controls/AsyncLink';
import produce from 'immer';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ScreenContainer from '../ScreenContainer';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Rating from '../../../../common/models/Rating';
import CommunityReadsQuery from '../../../../common/models/articles/CommunityReadsQuery';
import { Sort } from '../controls/articles/AotdView';
import {DeviceType} from '../../../../common/DeviceType';
import { ShareChannelData } from '../../../../common/sharing/ShareData';
import {SubscriptionStatus} from '../../../../common/models/subscriptions/SubscriptionStatus';
import ContendersView from '../controls/articles/ContendersView';

interface Props {
	deviceType: DeviceType,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<CommunityReadsQuery, CommunityReads>,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null,
	subscriptionStatus: SubscriptionStatus
}
interface State {
	communityReads: Fetchable<CommunityReads>,
	isLoading: boolean,
	maxLength?: number,
	minLength?: number,
	sort: Sort
}
class ContendersScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeSort = (sort: Sort) => {
		this.setState({
			isLoading: true,
			sort
		});
		this.fetchItems(this.state.minLength, this.state.maxLength, 1, sort);
	};
	private readonly _loadMore = () => {
		return new Promise<void>(
			resolve => {
				this.props.onGetCommunityReads(
					{
						pageNumber: this.state.communityReads.value.articles.pageNumber + 1,
						pageSize: 10,
						sort: this.state.sort,
						minLength: this.state.minLength,
						maxLength: this.state.maxLength
					},
					this._asyncTracker.addCallback(
						communityReads => {
							resolve();
							this.setState(
								produce(
									(state: State) => {
										state.communityReads.value.articles = {
											...communityReads.value.articles,
											items: state.communityReads.value.articles.items.concat(
												communityReads.value.articles.items
											)
										}
									}
								)
							);
						}
					)
				);
			}
		);
	};
	constructor(props: Props) {
		super(props);
		const sort = CommunityReadSort.Hot;
		this.state = {
			communityReads: props.onGetCommunityReads(
				{
					maxLength: null,
					minLength: null,
					pageNumber: 1,
					pageSize: 10,
					sort
				},
				this._asyncTracker.addCallback(
					communityReads => {
						this.setState({
							communityReads
						});
					}
				)
			),
			isLoading: false,
			sort
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateCommunityReads.call(this, event.article, event.isCompletionCommit);
			})
		);
	}
	private fetchItems(minLength: number | null, maxLength: number | null, pageNumber: number, sort: Sort) {
		this.props.onGetCommunityReads(
			{
				maxLength,
				minLength,
				pageNumber,
				pageSize: 10,
				sort
			},
			this._asyncTracker.addCallback(
				communityReads => {
					this.setState({
						communityReads,
						isLoading: false,
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
			<ScreenContainer className="contenders-screen_2yh8r3">
				{this.state.communityReads.isLoading ?
					<LoadingOverlay position="static" /> :
					<>
						<ContendersView
							articles={this.state.communityReads.value.articles}
							deviceType={this.props.deviceType}
							isLoading={this.state.isLoading}
							maxLength={this.state.maxLength}
							minLength={this.state.minLength}
							onChangeSort={this._changeSort}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onNavTo={this.props.onNavTo}
							onRateArticle={this.props.onRateArticle}
							onPostArticle={this.props.onPostArticle}
							onReadArticle={this.props.onReadArticle}
							onShare={this.props.onShare}
							onShareViaChannel={this.props.onShareViaChannel}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
							onViewProfile={this.props.onViewProfile}
							sort={this.state.sort}
							user={this.props.user}
						/>
						{!this.state.isLoading ?
							<div className="show-more">
								<AsyncLink
									text="Show more"
									onClick={this._loadMore}
								/>
							</div> :
							null}
					</>}
			</ScreenContainer>
		);
	}
}
export default function <TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user' | 'subscriptionStatus'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Contenders'
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<ContendersScreen {
				...{
					...deps,
					user: sharedState.user,
					subscriptionStatus: sharedState.subscriptionStatus
				}
			} />
		)
	};
}