import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import PageResult from '../../../../common/models/PageResult';
import HistoryScreen, { updateArticles } from '../screens/HistoryScreen';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetUserArticleHistory: FetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isLoadingArticles: boolean,
	maxLength: number | null,
	minLength: number | null
}
class AppHistoryScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeLengthRange = (minLength: number | null, maxLength: number | null) => {
		this.setState({
			isLoadingArticles: true,
			minLength,
			maxLength
		});
		this.fetchArticles(1, minLength, maxLength);
	};
	private readonly _loadPage = (pageNumber: number) => {
		this.setState({ isLoadingArticles: true });
		this.fetchArticles(pageNumber, this.state.minLength, this.state.maxLength);
	};
	constructor(props: Props) {
		super(props);
		const articles = this.fetchArticles(1, null, null);
		this.state = {
			articles,
			isLoadingArticles: articles.isLoading,
			maxLength: null,
			minLength: null
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateArticles.call(this, event.article);
			})
		);
	}
	private fetchArticles(pageNumber: number, minLength: number | null, maxLength: number | null) {
		return this.props.onGetUserArticleHistory(
			{ pageNumber, minLength, maxLength },
			this._asyncTracker.addCallback(articles => {
				this.setState({ articles, isLoadingArticles: false });
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<HistoryScreen
				articles={this.state.articles}
				isLoadingArticles={this.state.isLoadingArticles}
				maxLength={this.state.maxLength}
				minLength={this.state.minLength}
				onLengthRangeChange={this._changeLengthRange}
				onCopyTextToClipboard={this.props.onCopyTextToClipboard}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onLoadPage={this._loadPage}
				onReadArticle={this.props.onReadArticle}
				onShare={this.props.onShare}
				onToggleArticleStar={this.props.onToggleArticleStar}
				onViewComments={this.props.onViewComments}
			/>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Props
) {
	return {
		create: () => ({ key, title: 'History' }),
		render: () => (
			<AppHistoryScreen {...deps} />
		)
	};
}