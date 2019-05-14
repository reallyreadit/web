import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import Icon from '../../../../common/components/Icon';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, SharedState } from '../Root';
import AsyncActionLink from '../controls/AsyncActionLink';
import produce from 'immer';
import WelcomeInfoBox from '../WelcomeInfoBox';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import CommunityReadTimeWindow from '../../../../common/models/CommunityReadTimeWindow';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ScreenContainer from '../ScreenContainer';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow, minLength?: number, maxLength?: number }, CommunityReads>,
	onOpenMenu: () => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	user: UserAccount | null
}
interface State {
	communityReads: Fetchable<CommunityReads>,
	isLoadingArticles: boolean,
	maxLength?: number,
	minLength?: number,
	sort: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeLengthRange = (minLength?: number, maxLength?: number) => {
		this.setState({
			isLoadingArticles: true,
			maxLength,
			minLength
		});
		this.props.onGetCommunityReads(
			{
				pageNumber: 1,
				pageSize: 10,
				sort: this.state.sort,
				timeWindow: this.state.timeWindow,
				minLength,
				maxLength
			},
			this._asyncTracker.addCallback(communityReads => {
				this.setState({
					communityReads,
					isLoadingArticles: false
				});
			})
		);
	};
	private readonly _changeSort = (sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow) => {
		this.setState({
			isLoadingArticles: true,
			sort,
			timeWindow
		});
		this.props.onGetCommunityReads(
			{
				pageNumber: 1,
				pageSize: 10,
				sort,
				timeWindow,
				minLength: this.state.minLength,
				maxLength: this.state.maxLength
			},
			this._asyncTracker.addCallback(communityReads => {
				this.setState({
					communityReads,
					isLoadingArticles: false
				});
			})
		);
	};
	private readonly _loadMore = () => {
		return this._asyncTracker.addPromise(new Promise<void>((resolve, reject) => {
			this.props.onGetCommunityReads(
				{
					pageNumber: this.state.communityReads.value.articles.pageNumber + 1,
					pageSize: 10,
					sort: this.state.sort,
					timeWindow: this.state.timeWindow,
					minLength: this.state.minLength,
					maxLength: this.state.maxLength
				},
				this._asyncTracker.addCallback(communityReads => {
					resolve();
					this.setState(produce<State>(state => {
						state.communityReads.value.articles = {
							...communityReads.value.articles,
							items: state.communityReads.value.articles.items.concat(
								communityReads.value.articles.items
							)
						}
					}));
				})
			)
		}));
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			communityReads: props.onGetCommunityReads(
				{ pageNumber: 1, pageSize: 10, sort: CommunityReadSort.Hot },
				this._asyncTracker.addCallback(communityReads => {
					this.setState({ communityReads });
				})
			),
			isLoadingArticles: false,
			sort: CommunityReadSort.Hot
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateCommunityReads.call(this, event.article, event.isCompletionCommit);
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="home-screen_an7vm5">
				{this.state.communityReads.isLoading ?
					<LoadingOverlay position="static" /> :
					<>
						{(
							this.props.user &&
							!this.state.communityReads.value.userStats
						) ?
							<WelcomeInfoBox /> :
							null}
						<CommunityReadsList
							aotd={this.state.communityReads.value.aotd}
							articles={this.state.communityReads.value.articles}
							isLoadingArticles={this.state.isLoadingArticles}
							isUserSignedIn={!!this.props.user}
							maxLength={this.state.maxLength}
							minLength={this.state.minLength}
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onLengthRangeChange={this._changeLengthRange}
							onReadArticle={this.props.onReadArticle}
							onShare={this.props.onShare}
							onSortChange={this._changeSort}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
							sort={this.state.sort}
							timeWindow={this.state.timeWindow}
						/>
						{!this.state.isLoadingArticles ?
							<div className="show-more">
								<AsyncActionLink
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
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: () => ({
			key,
			titleContent: (
				<div className="home-screen_an7vm5-title-content">
					<img
						alt="logo"
						src="/images/logo.svg"
					/>
				</div>
			)
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomeScreen {...{ ...deps, user: sharedState.user }} />
		),
		renderHeaderContent: () => (
			<div
				className="home-screen_an7vm5-header-content"
				onClick={deps.onOpenMenu}
			>
				<Icon name="user" />
			</div>
		)
	};
}