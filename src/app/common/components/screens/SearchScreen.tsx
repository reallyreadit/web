import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Rating from '../../../../common/models/Rating';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount from '../../../../common/models/UserAccount';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';
import ScreenContainer from '../ScreenContainer';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import SearchOptions from '../../../../common/models/articles/SearchOptions';
import { FetchFunction } from '../../serverApi/ServerApi';
import SearchQuery from '../../../../common/models/articles/SearchQuery';
import PageResult from '../../../../common/models/PageResult';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import MultiSelectFilter from './SearchScreen/MultiSelectFilter';
import ContentBox from '../../../../common/components/ContentBox';
import ArticleLengthFilter from './SearchScreen/ArticleLengthFilter';
import List from '../controls/List';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import {DeviceType} from '../../../../common/DeviceType';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

interface Props {
	deviceType: DeviceType,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetSearchOptions: FetchFunction<SearchOptions>,
	onNavTo: (url: string) => boolean,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onSearchArticles: (query: SearchQuery) => Promise<PageResult<UserArticle>>,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	user: UserAccount
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	authors: string[],
	maxLength: number | null,
	minLength: number | null,
	options: Fetchable<SearchOptions>,
	sources: string[],
	tags: string[]
}
const searchPromiseTag = 'search';

class SearchScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeAuthors = (authors: string[]) => {
		this.setState(
			{
				authors
			},
			this._search
		);
	};
	private readonly _changeLength = (minLength: number | null, maxLength: number | null) => {
		this.setState(
			{
				maxLength,
				minLength
			},
			this._search
		);
	};
	private readonly _changeSources = (sources: string[]) => {
		this.setState(
			{
				sources
			},
			this._search
		);
	};
	private readonly _changeTags = (tags: string[]) => {
		this.setState(
			{
				tags
			},
			this._search
		);
	};
	private readonly _search = () => {
		if (
			this.state.authors.length === 0 &&
			this.state.sources.length === 0 &&
			this.state.tags.length === 0
		) {
			this.setState({
				articles: {
					isLoading: false,
					value: null
				}
			});
			return;
		}
		this._asyncTracker.cancelAll(searchPromiseTag);
		this.setState(
			{
				articles: {
					isLoading: true
				}
			},
			() => {
				this._asyncTracker
					.addPromise(
						this.props.onSearchArticles({
							authors: this.state.authors,
							maxLength: this.state.maxLength,
							minLength: this.state.minLength,
							sources: this.state.sources,
							tags: this.state.tags
						}),
						searchPromiseTag
					)
					.then(
						articles => {
							this.setState({
								articles: {
									isLoading: false,
									value: articles
								}
							});
						}
					);
			}
		);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			articles: {
				isLoading: false,
				value: null
			},
			authors: [],
			maxLength: null,
			minLength: null,
			options: props.onGetSearchOptions(
				this._asyncTracker.addCallback(
					options => {
						this.setState({
							options
						});
					}
				)
			),
			sources: [],
			tags: []
		};
		this._asyncTracker.addCancellationDelegate(
			this.props.onRegisterArticleChangeHandler(
				event => {
					const articles = this.state.articles.value?.items;
					if (
						!articles?.some(
							article => article.id === event.article.id
						)
					) {
						return;
					}
					this.setState({
						articles: {
							isLoading: false,
							value: {
								...this.state.articles.value,
								items: articles
									.slice()
									.map(
										article => event.article.id === article.id ?
											event.article :
											article
									)
							}
						}
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
			<ScreenContainer className="search-screen_cdqndl">
				{this.state.options.isLoading ?
					<LoadingOverlay position="absolute" /> :
					<>
						<ContentBox className="filters">
							<MultiSelectFilter
								onChange={this._changeSources}
								options={this.state.options.value.sources}
								title="Publications"
								value={this.state.sources}
							/>
							<MultiSelectFilter
								onChange={this._changeTags}
								options={this.state.options.value.tags}
								title="Topics"
								value={this.state.tags}
							/>
							<MultiSelectFilter
								onChange={this._changeAuthors}
								options={this.state.options.value.authors}
								title="Writers"
								value={this.state.authors}
							/>
							<ArticleLengthFilter
								max={this.state.maxLength}
								min={this.state.minLength}
								onChange={this._changeLength}
							/>
						</ContentBox>
						{this.state.articles.isLoading ?
							<LoadingOverlay position="static" /> :
							this.state.articles.value ?
								this.state.articles.value.items.length ?
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
									</List> :
									<div className="no-results">No articles found.</div> :
								null}
					</>}
			</ScreenContainer>
		);
	}
}

export default function createSearchScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Search'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<SearchScreen
				deviceType={services.deviceType}
				onCreateAbsoluteUrl={services.onCreateAbsoluteUrl}
				onGetSearchOptions={services.onGetSearchOptions}
				onNavTo={services.onNavTo}
				onPostArticle={services.onPostArticle}
				onRateArticle={services.onRateArticle}
				onReadArticle={services.onReadArticle}
				onRegisterArticleChangeHandler={services.onRegisterArticleChangeHandler}
				onSearchArticles={services.onSearchArticles}
				onShare={services.onShare}
				onShareViaChannel={services.onShareViaChannel}
				onToggleArticleStar={services.onToggleArticleStar}
				onViewComments={services.onViewComments}
				onViewProfile={services.onViewProfile}
				onViewThread={services.onViewThread}
				user={sharedState.user}
			/>
		)
	};
}