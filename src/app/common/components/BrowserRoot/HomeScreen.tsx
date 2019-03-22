import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen } from '../Root';
import PageSelector from '../controls/PageSelector';
import ReadReadinessInfoBox from './ReadReadinessInfoBox';
import { SharedState } from '../BrowserRoot';
import WelcomeInfoBox from '../WelcomeInfoBox';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import MarketingScreen from './MarketingScreen';

interface Props {
	isBrowserCompatible: boolean,
	isExtensionInstalled: boolean | null,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort }, CommunityReads>,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: () => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle, isCompletionCommit: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: () => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewPrivacyPolicy: () => void,
	user: UserAccount | null
}
interface State {
	communityReads: Fetchable<CommunityReads>,
	isLoadingArticles: boolean,
	sort: CommunityReadSort
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePage = (pageNumber: number) => {
		this.setState({ isLoadingArticles: true });
		this.props.onGetCommunityReads(
			{ pageNumber: pageNumber, pageSize: 40, sort: this.state.sort },
			this._asyncTracker.addCallback(communityReads => {
				this.setState({
					communityReads,
					isLoadingArticles: false
				});
			})
		);
	};
	private readonly _changeSort = (sort: CommunityReadSort) => {
		this.setState({
			isLoadingArticles: true,
			sort
		});
		this.props.onGetCommunityReads(
			{
				pageNumber: 1,
				pageSize: 40,
				sort
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
		this.state = {
			communityReads: props.onGetCommunityReads(
				{ pageNumber: 1, pageSize: 40, sort: CommunityReadSort.Hot },
				this._asyncTracker.addCallback(communityReads => {
					this.setState({ communityReads });
				})
			),
			isLoadingArticles: false,
			sort: CommunityReadSort.Hot
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler((updatedArticle, isCompletionCommit) => {
				updateCommunityReads.call(this, updatedArticle, isCompletionCommit);
			}),
			props.onRegisterUserChangeHandler(() => {
				this.setState({
					communityReads: props.onGetCommunityReads(
						{ pageNumber: 1, pageSize: 40, sort: CommunityReadSort.Hot },
						this._asyncTracker.addCallback(communityReads => {
							this.setState({ communityReads });
						})
					),
					isLoadingArticles: false,
					sort: CommunityReadSort.Hot
				});
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		if (!this.props.user) {
			return (
				<MarketingScreen
					onOpenCreateAccountDialog={this.props.onOpenCreateAccountDialog}
					onViewPrivacyPolicy={this.props.onViewPrivacyPolicy}
				/>
			);
		}
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
}
export default function <TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'isExtensionInstalled' | 'user'>>
) {
	return {
		create: () => ({ key, title: 'Home' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomeScreen {
				...{
					...deps,
					isExtensionInstalled: sharedState.isExtensionInstalled,
					user: sharedState.user
				}}
			/>
		)
	};
}