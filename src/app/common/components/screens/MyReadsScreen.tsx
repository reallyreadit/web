import * as React from 'react';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareData from '../../../../common/sharing/ShareData';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import Fetchable from '../../../../common/Fetchable';
import PageResult from '../../../../common/models/PageResult';
import ScreenContainer from '../ScreenContainer';
import LoadingOverlay from '../controls/LoadingOverlay';
import RouteLocation from '../../../../common/routing/RouteLocation';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import ArticleLengthFilter from '../controls/ArticleLengthFilter';
import ArticleList from '../controls/articles/ArticleList';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import InfoBox from '../controls/InfoBox';
import HeaderSelector from '../HeaderSelector';
import { Screen } from '../Root';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';

enum List {
	History = 'History',
	Starred = 'Starred'
}
type ArticleFetchFunction = FetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>;
interface Props {
	list: List,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetStarredArticles: ArticleFetchFunction,
	onGetUserArticleHistory: ArticleFetchFunction,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onSetScreenState: (id: number, nextState: (prevState: Screen) => Partial<Screen>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	screenId: number
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isScreenLoading: boolean,
	maxLength: number | null,
	minLength: number | null
}
const headerSelectorItems = [
	{ value: List.Starred },
	{ value: List.History }
];
class MyReadsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeLengthRange = (minLength: number | null, maxLength: number | null) => {
		this.setState({
			articles: { isLoading: true },
			minLength,
			maxLength
		});
		this.fetchArticles(this.props.list, 1, minLength, maxLength);
	};
	private readonly _changeList = (value: string) => {
		const list = value as List;
		if (list !== this.props.list) {
			this.setState({
				articles: { isLoading: true }
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
	constructor(props: Props) {
		super(props);
		const
			minLength: number | null = null,
			maxLength: number | null = null,
			articles = this.fetchArticles(
				props.list,
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
						this.setState(produce<State>(prevState => {
							prevState.articles.value.items.forEach((article, index, articles) => {
								if (article.id === event.article.id) {
									articles.splice(articles.indexOf(article), 1, event.article);
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
		maxLength: number | null,
		callback?: () => void
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
			<ScreenContainer className="my-reads-screen_56ihtk">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="static" /> :
					<>
						<div className="controls">
							<HeaderSelector
								disabled={this.state.articles.isLoading}
								items={headerSelectorItems}
								onChange={this._changeList}
								value={this.props.list}
							/>
							<ArticleLengthFilter
								max={this.state.maxLength}
								min={this.state.minLength}
								onChange={this._changeLengthRange}
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
														isUserSignedIn
														onCopyTextToClipboard={this.props.onCopyTextToClipboard}
														onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
														onPost={this.props.onPostArticle}
														onRead={this.props.onReadArticle}
														onShare={this.props.onShare}
														onToggleStar={this.props.onToggleArticleStar}
														onViewComments={this.props.onViewComments}
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
								</> :
								<InfoBox
									position="static"
									style="normal"
								>
									{this.props.list === List.Starred ?
										<>
											<p>You have 0 starred articles.</p>
											<p><strong>Star articles to save them for later.</strong></p>
										</> :
										<>
											<p>You've read 0 articles.</p>
											<p><strong>Go read something!</strong></p>
										</>}
								</InfoBox>}
					</>}
			</ScreenContainer>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'list' | 'screenId'>>
) {
	const route = findRouteByKey(routes, ScreenKey.MyReads);
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'My Reads' }),
		render: (screen: Screen) => (
			<MyReadsScreen {
				...{
					...deps,
					list: route.getPathParams(screen.location.path)['view'] === 'starred' ?
						List.Starred :
						List.History,
					screenId: screen.id
				}
			} />
		)
	};
}