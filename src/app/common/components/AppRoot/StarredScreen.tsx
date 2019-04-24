import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import PageResult from '../../../../common/models/PageResult';
import StarredScreen, { updateArticles } from '../screens/StarredScreen';
import { Screen, SharedState } from '../Root';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncActionLink from '../controls/AsyncActionLink';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';
import ScreenContainer from '../ScreenContainer';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetStarredArticles: FetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onSendExtensionInstructions: () => Promise<void>,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	user: UserAccount | null
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>
}
class AppStarredScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _loadPage = (pageNumber: number) => {
		this.setState({
			articles: this.fetchArticles(pageNumber)
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			articles: this.fetchArticles(1)
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				updateArticles.call(this, event.article);
			})
		);
	}
	private fetchArticles(pageNumber: number) {
		return this.props.onGetStarredArticles(
			{ pageNumber },
			this._asyncTracker.addCallback(articles => {
				this.setState({ articles });
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer>
				<div className="starred-screen_jocosv">
					{this.state.articles.isLoading ?
						<LoadingOverlay /> :
						<>
							<p>
								{this.state.articles.value.items.length ?
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
								isUserSignedIn={!!this.props.user}
								onCopyTextToClipboard={this.props.onCopyTextToClipboard}
								onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
								onLoadPage={this._loadPage}
								onReadArticle={this.props.onReadArticle}
								onShare={this.props.onShare}
								onToggleArticleStar={this.props.onToggleArticleStar}
								onViewComments={this.props.onViewComments}
							/>
						</>}
				</div>
			</ScreenContainer>
		);
	}
}
export default function <TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: () => ({ key, title: 'Starred' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<AppStarredScreen {...{ ...deps, user: sharedState.user }} />
		)
	};
}