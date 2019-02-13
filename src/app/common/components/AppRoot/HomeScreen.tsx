import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadsList, { updateCommunityReads } from '../controls/articles/CommunityReadsList';
import logoText from '../../../../common/svg/logoText';
import Icon from '../../../../common/components/Icon';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { Screen, SharedState } from '../Root';
import AsyncActionLink from '../controls/AsyncActionLink';
import produce from 'immer';
import WelcomeInfoBox from '../WelcomeInfoBox';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetCommunityReads: FetchFunctionWithParams<{ pageNumber: number, pageSize: number, sort: CommunityReadSort }, CommunityReads>,
	onOpenMenu: () => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (updatedArticle: UserArticle, isCompletionCommit: boolean) => void) => Function,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	user: UserAccount | null
}
interface State {
	communityReads: Fetchable<CommunityReads>,
	isLoadingArticles: boolean,
	sort: CommunityReadSort
}
class HomeScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeSort = (sort: CommunityReadSort) => {
		this.setState({
			isLoadingArticles: true,
			sort
		});
		this.props.onGetCommunityReads(
			{
				pageNumber: 1,
				pageSize: 10,
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
	private readonly _loadMore = () => {
		return this._asyncTracker.addPromise(new Promise<void>((resolve, reject) => {
			this.props.onGetCommunityReads(
				{
					pageNumber: this.state.communityReads.value.articles.pageNumber + 1,
					pageSize: 10,
					sort: this.state.sort
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
			props.onRegisterArticleChangeHandler((updatedArticle, isCompletionCommit) => {
				updateCommunityReads.call(this, updatedArticle, isCompletionCommit);
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="home-screen_an7vm5">
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
							onCopyTextToClipboard={this.props.onCopyTextToClipboard}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onReadArticle={this.props.onReadArticle}
							onShareArticle={this.props.onShareArticle}
							onSortChange={this._changeSort}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
							sort={this.state.sort}
						/>
						{!this.state.isLoadingArticles ?
							<AsyncActionLink
								text="Show more"
								onClick={this._loadMore}
							/> :
							null}
					</>}
			</div>
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
				<div
					className="home-screen_an7vm5-title-content"
					dangerouslySetInnerHTML={{ __html: logoText }}
				></div>
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