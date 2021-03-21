import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareData from '../../../../common/sharing/ShareData';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import Fetchable from '../../../../common/Fetchable';
import PageResult from '../../../../common/models/PageResult';
import ScreenContainer from '../ScreenContainer';
import LoadingOverlay from '../controls/LoadingOverlay';
import RouteLocation from '../../../../common/routing/RouteLocation';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import ArticleList from '../controls/articles/ArticleList';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import HeaderSelector from '../HeaderSelector';
import { Screen, SharedState } from '../Root';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import UpdateBanner from '../../../../common/components/UpdateBanner';
import { formatCountable } from '../../../../common/format';
import Rating from '../../../../common/models/Rating';
import UserAccount from '../../../../common/models/UserAccount';
import CenteringContainer from '../../../../common/components/CenteringContainer';
import StickyNote from '../../../../common/components/StickyNote';
import Dialog from '../../../../common/components/Dialog';

enum List {
	History = 'History',
	Starred = 'Starred'
}
type ArticleFetchFunction = FetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>;
interface Props {
	list: List,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string
	onGetStarredArticles: ArticleFetchFunction,
	onGetUserArticleHistory: ArticleFetchFunction,
	onOpenDialog: (element: React.ReactNode) => void,
	onCloseDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterNewStarsHandler?: (handler: (count: number) => void) => Function,
	onSetScreenState: (id: number, nextState: (prevState: Screen) => Partial<Screen>) => void,
	onShare: (data: ShareData) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	screenId: number,
	user: UserAccount
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isChangingList: boolean,
	isScreenLoading: boolean,
	maxLength: number | null,
	minLength: number | null,
	newStarsCount: number
}
const headerSelectorItems = [
	{ value: List.Starred },
	{ value: List.History }
];
class MyReadsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeList = (value: string) => {
		const list = value as List;
		if (list !== this.props.list) {
			this.setState({
				articles: {
					isLoading: true
				},
				isChangingList: true
			});
			this.props.onSetScreenState(
				this.props.screenId,
				() => ({
					location: {
						path: list === List.Starred ?
							'/starred' :
							'/history'
					}
				})
			);
			this.fetchArticles(list, 1, this.state.minLength, this.state.maxLength);
		}
	};
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			articles: { isLoading: true }
		});
		this.fetchArticles(this.props.list, pageNumber, this.state.minLength, this.state.maxLength);
	};
	private readonly _openImportDialog = () => {
		this.props.onOpenDialog(
			<Dialog
				onClose={this.props.onCloseDialog}
				size="small"
				title="Import Articles to Readup"
			>
				<img src={this.props.onCreateStaticContentUrl('/app/images/import-screenshot.png')} alt="Import Screenshot" style={{ maxWidth: '100%' }} />
			</Dialog>
		);
	};
	constructor(props: Props) {
		super(props);
		const
			minLength: number | null = null,
			maxLength: number | null = null,
			articles = this.fetchArticles(props.list, 1, minLength, maxLength);
		this.state = {
			articles,
			isChangingList: false,
			isScreenLoading: articles.isLoading,
			maxLength,
			minLength,
			newStarsCount: 0
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
		if (props.onRegisterNewStarsHandler) {
			props.onRegisterNewStarsHandler(
				newStarsCount => {
					if (this.props.list === List.Starred) {
						this.setState({
							minLength: null,
							maxLength: null,
							newStarsCount
						});
						this.fetchArticles(this.props.list, 1, null, null);
					}
				}
			)
		}
	}
	private fetchArticles(
		list: List,
		pageNumber: number,
		minLength: number | null,
		maxLength: number | null
	) {
		let fetchFunction: ArticleFetchFunction;
		switch (list) {
			case List.History:
				fetchFunction = this.props.onGetUserArticleHistory;
				break;
			case List.Starred:
				fetchFunction = this.props.onGetStarredArticles;
				break;
		}
		return fetchFunction(
			{ pageNumber, minLength, maxLength },
			this._asyncTracker.addCallback(
				articles => {
					this.setState({
						articles,
						isChangingList: false,
						isScreenLoading: false,
						newStarsCount: 0
					});
				}
			)
		);
	}
	private renderStickyNote() {
		return (
			<StickyNote>
				{this.props.list === List.Starred ?
					<>
						<strong>Star the articles you want to read.</strong>
						<span>Pro tip: Import articles from elsewhere. <span onClick={this._openImportDialog} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Learn more.</span></span>
					</> :
					<>
						<strong>Your reading history is private.</strong>
						<span>You choose what you want to post.</span>
					</>}
			</StickyNote>
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="my-reads-screen_56ihtk">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="static" /> :
					<>
						{this.state.newStarsCount ?
							<UpdateBanner
								isBusy
								text={`Loading ${this.state.newStarsCount} new ${formatCountable(this.state.newStarsCount, 'article')}`}
							/> :
							null}
						<div className="controls">
							<HeaderSelector
								disabled={this.state.articles.isLoading}
								items={headerSelectorItems}
								onChange={this._changeList}
								value={this.props.list}
							/>
						</div>
						{this.state.articles.isLoading ?
							<LoadingOverlay position="static" /> :
							this.state.articles.value.items.length ?
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
									{this.state.articles.value.pageNumber < 2 ?
										this.renderStickyNote() :
										null}
									<PageSelector
										pageNumber={this.state.articles.value.pageNumber}
										pageCount={this.state.articles.value.pageCount}
										onChange={this._changePageNumber}
									/>
								</> :
								<CenteringContainer>
									{this.renderStickyNote()}
								</CenteringContainer>}
					</>}
			</ScreenContainer>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'list' | 'screenId' | 'user'>>
) {
	const route = findRouteByKey(routes, ScreenKey.MyReads);
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'My Reads' }),
		render: (screen: Screen, sharedState: SharedState) => (
			<MyReadsScreen {
				...{
					...deps,
					list: route.getPathParams(screen.location.path)['view'] === 'starred' ?
						List.Starred :
						List.History,
					screenId: screen.id,
					user: sharedState.user
				}
			} />
		)
	};
}