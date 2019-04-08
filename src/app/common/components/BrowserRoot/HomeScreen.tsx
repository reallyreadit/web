import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, TemplateSection } from '../Root';
import PageSelector from '../controls/PageSelector';
import ReadReadinessInfoBox from './ReadReadinessInfoBox';
import { SharedState } from '../BrowserRoot';
import WelcomeInfoBox from '../WelcomeInfoBox';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import MarketingScreen from './MarketingScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommunityReadTimeWindow from '../../../../common/models/CommunityReadTimeWindow';

const
	pageSize = 40,
	defaultQueryParams = {
		pageNumber: 1,
		pageSize,
		sort: CommunityReadSort.Hot
	};
function shouldShowHomeScreen(user: UserAccount | null, isDesktopDevice: boolean) {
	return user && isDesktopDevice;
}
interface Props {
	isDesktopDevice: boolean,
	isBrowserCompatible: boolean,
	isIosDevice: boolean | null,
	isExtensionInstalled: boolean | null,
	onCopyAppReferrerTextToClipboard: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow }, CommunityReads>,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: () => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle, isCompletionCommit: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onSetScreenState: (getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewPrivacyPolicy: () => void,
	user: UserAccount | null
}
interface State {
	communityReads?: Fetchable<CommunityReads>,
	isLoadingArticles: boolean,
	sort?: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePage = (pageNumber: number) => {
		this.setState({ isLoadingArticles: true });
		this.props.onGetCommunityReads(
			{
				pageNumber: pageNumber,
				pageSize,
				sort: this.state.sort,
				timeWindow: this.state.timeWindow
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
				pageSize,
				sort,
				timeWindow
			},
			this._asyncTracker.addCallback(communityReads => {
				this.setState({
					communityReads,
					isLoadingArticles: false
				});
			})
		)
	};
	constructor(props: Props) {
		super(props);
		if (shouldShowHomeScreen(props.user, props.isDesktopDevice)) {
			this.state = {
				communityReads: props.onGetCommunityReads(
					defaultQueryParams,
					this._asyncTracker.addCallback(communityReads => {
						this.setState({ communityReads });
					})
				),
				isLoadingArticles: false,
				sort: CommunityReadSort.Hot
			};
		} else {
			this.state = {
				isLoadingArticles: false
			};
		}
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler((updatedArticle, isCompletionCommit) => {
				updateCommunityReads.call(this, updatedArticle, isCompletionCommit);
			}),
			props.onRegisterUserChangeHandler((user: UserAccount | null) => {
				if (shouldShowHomeScreen(user, this.props.isDesktopDevice)) {
					this.setState({
						communityReads: props.onGetCommunityReads(
							defaultQueryParams,
							this._asyncTracker.addCallback(communityReads => {
								this.setState({ communityReads });
							})
						),
						isLoadingArticles: false,
						sort: CommunityReadSort.Hot
					});
					this.props.onSetScreenState(() => ({
						templateSection: null
					}));
				} else {
					this.setState({
						communityReads: null,
						isLoadingArticles: false,
						sort: null,
						timeWindow: null
					});
					this.props.onSetScreenState(() => ({
						templateSection: TemplateSection.Header
					}));
				}
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (shouldShowHomeScreen(this.props.user, this.props.isDesktopDevice) && this.state.communityReads && this.state.sort != null) {
			return (
				<div className="home-screen_1sjipy">
					{this.props.user && this.props.isExtensionInstalled === false ?
						<ReadReadinessInfoBox
							isBrowserCompatible={this.props.isBrowserCompatible}
							onInstallExtension={this.props.onInstallExtension}
						/> :
						null}
					{this.state.communityReads.isLoading ?
						<LoadingOverlay position="static" /> :
						<>
							{(
								this.props.user &&
								this.props.isExtensionInstalled &&
								!this.state.communityReads.value.userStats
							) ?
								<WelcomeInfoBox /> :
								null}
							<CommunityReadsList
								aotd={this.state.communityReads.value.aotd}
								articles={this.state.communityReads.value.articles}
								isLoadingArticles={this.state.isLoadingArticles}
								isUserSignedIn={!!this.props.user}
								onCopyTextToClipboard={this.props.onCopyTextToClipboard}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onReadArticle={this.props.onReadArticle}
								onShare={this.props.onShare}
								onSortChange={this._changeSort}
								onToggleArticleStar={this.props.onToggleArticleStar}
								onViewComments={this.props.onViewComments}
								sort={this.state.sort}
								timeWindow={this.state.timeWindow}
							/>
							{!this.state.isLoadingArticles ?
								<PageSelector
									pageNumber={this.state.communityReads.value.articles.pageNumber}
									pageCount={this.state.communityReads.value.articles.pageCount}
									onChange={this._changePage}
								/> :
								null}
						</>}
				</div>
			);
		}
		return (
			<MarketingScreen
				isDesktopDevice={this.props.isDesktopDevice}
				isIosDevice={this.props.isIosDevice}
				isUserSignedIn={!!this.props.user}
				onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
				onInstallExtension={this.props.onInstallExtension}
				onOpenCreateAccountDialog={this.props.onOpenCreateAccountDialog}
				onViewPrivacyPolicy={this.props.onViewPrivacyPolicy}
			/>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'isExtensionInstalled' | 'isIosDevice' | 'onSetScreenState' | 'user'>> & {
		onSetScreenState: (key: TScreenKey, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void
	}
) {
	const setScreenState = (getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => {
		deps.onSetScreenState(key, getNextState);
	};
	return {
		create: (location: RouteLocation, sharedState: SharedState) => ({
			key,
			templateSection: shouldShowHomeScreen(sharedState.user, deps.isDesktopDevice) ?
				null :
				TemplateSection.Header,
			title: 'Readup'
		}),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomeScreen {
				...{
					...deps,
					...sharedState,
					onSetScreenState: setScreenState
				}}
			/>
		)
	};
}