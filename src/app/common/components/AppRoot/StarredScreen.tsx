import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import PageResult from '../../../../common/models/PageResult';
import StarredScreen, { updateArticles } from '../screens/StarredScreen';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncActionLink from '../controls/AsyncActionLink';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import ScreenContainer from '../ScreenContainer';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetStarredArticles: FetchFunctionWithParams<{ pageNumber: number, minLength?: number, maxLength?: number }, PageResult<UserArticle>>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onSendExtensionInstructions: () => Promise<void>,
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
class AppStarredScreen extends React.Component<Props, State> {
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
		this.state = {
			articles: this.fetchArticles(1, null, null),
			isLoadingArticles: true,
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
		return this.props.onGetStarredArticles(
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
			<ScreenContainer className="starred-screen_jocosv">
				{this.state.articles.isLoading ?
					<LoadingOverlay position="static" /> :
					<>
						<p>
							{this.state.isLoadingArticles || this.state.articles.value.items.length || this.state.minLength != null || this.state.maxLength != null ?
								<>
									Pro tip: Add the Chrome extension to star articles from your computer.
									<AsyncActionLink
										icon="email"
										onClick={this.props.onSendExtensionInstructions}
										text="Email me the link."
									/>
								</> :
								null}
						</p>
						<StarredScreen
							articles={this.state.articles.value}
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
					</>}
			</ScreenContainer>
		);
	}
}
export default function <TScreenKey>(
	key: TScreenKey,
	deps: Props
) {
	return {
		create: () => ({ key, title: 'Starred' }),
		render: () => (
			<AppStarredScreen {...deps} />
		)
	};
}