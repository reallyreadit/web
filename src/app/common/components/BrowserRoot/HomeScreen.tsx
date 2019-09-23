import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads, View } from '../controls/articles/CommunityReadsList';
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
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ScreenContainer from '../ScreenContainer';
import CommentThread from '../../../../common/models/CommentThread';
import Post from '../../../../common/models/social/Post';
import PageResult from '../../../../common/models/PageResult';
import FolloweesPostsQuery from '../../../../common/models/social/FolloweesPostsQuery';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Alert from '../../../../common/models/notifications/Alert';

const pageSize = 40;
function shouldShowHomeScreen(user: UserAccount | null, isDesktopDevice: boolean) {
	return user && isDesktopDevice;
}
interface Props {
	highlightedCommentId: string | null,
	highlightedPostId: string | null,
	isDesktopDevice: boolean,
	isBrowserCompatible: boolean,
	isIosDevice: boolean | null,
	isExtensionInstalled: boolean | null,
	marketingScreenVariant: number,
	onClearAlerts: (alert: Alert) => void,
	onCopyAppReferrerTextToClipboard: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow, minLength?: number, maxLength?: number }, CommunityReads>,
	onGetFolloweesPosts: FetchFunctionWithParams<FolloweesPostsQuery, PageResult<Post>>,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewPrivacyPolicy: () => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	screenId: number,
	user: UserAccount | null,
	view: View
}
interface State {
	communityReads?: Fetchable<CommunityReads>,
	isLoading: boolean,
	maxLength?: number,
	minLength?: number,
	posts?: Fetchable<PageResult<Post>>,
	sort?: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePage = (pageNumber: number) => {
		this.setState({ isLoading: true });
		this.fetchItems(this.props.view, this.state.sort, this.state.timeWindow, this.state.minLength, this.state.maxLength, pageNumber);
	};
	private readonly _changeParams = (view: View, sort: CommunityReadSort, timeWindow: CommunityReadTimeWindow | null, minLength: number | null, maxLength: number | null) => {
		this.setState({
			isLoading: true,
			sort, timeWindow, minLength, maxLength
		});
		this.props.onSetScreenState(
			this.props.screenId,
			() => ({
				location: {
					path: view === View.Trending ?
						'/' :
						'/following'
				}
			})
		);
		this.fetchItems(view, sort, timeWindow, minLength, maxLength, 1);
	};
	private _hasClearedAlerts = false;
	constructor(props: Props) {
		super(props);
		if (shouldShowHomeScreen(props.user, props.isDesktopDevice)) {
			switch (props.view) {
				case View.Trending:
					this.state = {
						communityReads: props.onGetCommunityReads(
							{
								pageNumber: 1,
								pageSize,
								sort: CommunityReadSort.Hot
							},
							this._asyncTracker.addCallback(
								communityReads => {
									this.setState({ communityReads });
								}
							)
						),
						isLoading: false,
						sort: CommunityReadSort.Hot
					};
					break;
				case View.Following:
					this.state = {
						posts: props.onGetFolloweesPosts(
							{
								maxLength: null,
								minLength: null,
								pageNumber: 1
							},
							this._asyncTracker.addCallback(
								posts => {
									this.setState({ posts });
								}
							)
						),
						isLoading: false,
						sort: CommunityReadSort.Hot
					};
					break;
			}
		} else {
			this.state = {
				isLoading: false
			};
		}
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateCommunityReads.call(this, event.article, event.isCompletionCommit);
			}),
			props.onRegisterUserChangeHandler((user: UserAccount | null) => {
				if (shouldShowHomeScreen(user, this.props.isDesktopDevice)) {
					this.setState({
						communityReads: props.onGetCommunityReads(
							{
								pageNumber: 1,
								pageSize,
								sort: CommunityReadSort.Hot
							},
							this._asyncTracker.addCallback(
								communityReads => {
									this.setState({ communityReads });
								}
							)
						),
						isLoading: false,
						sort: CommunityReadSort.Hot
					});
					this.props.onSetScreenState(
						this.props.screenId,
						() => ({
							location: { path: '/' },
							templateSection: null
						})
					);
				} else {
					this.setState({
						communityReads: null,
						isLoading: false,
						sort: null,
						timeWindow: null,
						minLength: null,
						maxLength: null
					});
					this.props.onSetScreenState(
						this.props.screenId,
						() => ({
							location: { path: '/' },
							templateSection: TemplateSection.Header
						})
					);
				}
			})
		);
	}
	private clearAlertsIfNeeded() {
		if (
			!this._hasClearedAlerts &&
			this.props.user.postAlertCount
		) {
			this.props.onClearAlerts(Alert.Following);
			this._hasClearedAlerts = true;
		}
	}
	private fetchItems(view: View, sort: CommunityReadSort, timeWindow: CommunityReadTimeWindow | null, minLength: number | null, maxLength: number | null, pageNumber: number) {
		switch (view) {
			case View.Trending:
				this.props.onGetCommunityReads(
					{
						pageNumber,
						pageSize,
						sort,
						timeWindow,
						minLength,
						maxLength
					},
					this._asyncTracker.addCallback(
						communityReads => {
							this.setState({
								communityReads,
								isLoading: false
							});
						}
					)
				);
				break;
			case View.Following:
				this.props.onGetFolloweesPosts(
					{
						pageNumber,
						minLength,
						maxLength
					},
					this._asyncTracker.addCallback(
						posts => {
							this.setState({
								isLoading: false,
								posts
							});
							this.clearAlertsIfNeeded();
						}
					)
				);
				break;
		}
	}
	public componentDidMount() {
		if (this.state.posts && !this.state.posts.isLoading) {
			this.clearAlertsIfNeeded();
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (
			shouldShowHomeScreen(this.props.user, this.props.isDesktopDevice) &&
			(this.state.communityReads || this.state.posts) &&
			this.state.sort != null
		) {
			return (
				<ScreenContainer className="home-screen_1sjipy">
					{this.props.user && this.props.isExtensionInstalled === false ?
						<ReadReadinessInfoBox
							isBrowserCompatible={this.props.isBrowserCompatible}
							onInstallExtension={this.props.onInstallExtension}
						/> :
						null}
					{(
						(this.state.communityReads && this.state.communityReads.isLoading) ||
						(this.state.posts && this.state.posts.isLoading)
					) ?
						<LoadingOverlay position="static" /> :
						<>
							{(
								this.props.user &&
								this.props.isExtensionInstalled &&
								!this.state.posts &&
								!this.state.communityReads.value.userReadCount
							) ?
								<WelcomeInfoBox /> :
								null}
							<CommunityReadsList
								aotd={this.state.communityReads && this.state.communityReads.value.aotd}
								articles={this.state.communityReads && this.state.communityReads.value.articles}
								highlightedCommentId={this.props.highlightedCommentId}
								highlightedPostId={this.props.highlightedPostId}
								isLoading={this.state.isLoading}
								maxLength={this.state.maxLength}
								minLength={this.state.minLength}
								onCopyTextToClipboard={this.props.onCopyTextToClipboard}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onParamsChanged={this._changeParams}
								onPostArticle={this.props.onPostArticle}
								onReadArticle={this.props.onReadArticle}
								onShare={this.props.onShare}
								onToggleArticleStar={this.props.onToggleArticleStar}
								onViewComments={this.props.onViewComments}
								onViewProfile={this.props.onViewProfile}
								onViewThread={this.props.onViewThread}
								posts={this.state.posts && this.state.posts.value}
								sort={this.state.sort}
								timeWindow={this.state.timeWindow}
								user={this.props.user}
								view={this.props.view}
							/>
							{(
								!this.state.isLoading && (
									this.props.view === View.Trending ||
									this.state.posts.value.items.length
								)
							) ?
								<PageSelector
									pageNumber={
										this.props.view === View.Trending ?
											this.state.communityReads.value.articles.pageNumber :
											this.state.posts.value.pageNumber}
									pageCount={
										this.props.view === View.Trending ?
											this.state.communityReads.value.articles.pageCount :
											this.state.posts.value.pageCount
									}
									onChange={this._changePage}
								/> :
								null}
						</>}
				</ScreenContainer>
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
				variant={this.props.marketingScreenVariant}
			/>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'highlightedCommentId' | 'highlightedPostId' | 'isExtensionInstalled' | 'isIosDevice' | 'screenId' | 'user' | 'view'>>
) {
	const route = findRouteByKey(routes, ScreenKey.Home);
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => ({
			id,
			key,
			location,
			templateSection: shouldShowHomeScreen(sharedState.user, deps.isDesktopDevice) ?
				null :
				TemplateSection.Header,
			title: 'Readup'
		}),
		render: (screenState: Screen, sharedState: SharedState) => {
			const pathParams = route.getPathParams(screenState.location.path);
			return (
				<HomeScreen {
					...{
						...deps,
						...sharedState,
						highlightedCommentId: (
							pathParams['highlightedType'] === 'comment' ?
								pathParams['highlightedId'] :
								null
						),
						highlightedPostId: (
							pathParams['highlightedType'] === 'post' ?
								pathParams['highlightedId'] :
								null
						),
						screenId: screenState.id,
						view: pathParams['view'] === 'trending' ?
							View.Trending :
							View.Following
					}
				} />
			);
		}
	};
}