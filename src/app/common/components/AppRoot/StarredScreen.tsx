import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../AsyncTracker';
import PageResult from '../../../../common/models/PageResult';
import StarredScreen, { updateArticles } from '../screens/StarredScreen';
import { Screen, RootState } from '../Root';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncActionLink from '../controls/AsyncActionLink';

interface Props {
	onGetStarredArticles: FetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onSendExtensionInstructions: () => Promise<void>,
	onShareArticle: (article: UserArticle) => void,
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
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
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
			<div className="starred-screen_jocosv">
				{this.state.articles.isLoading ?
					<LoadingOverlay /> :
					<>
						<p>
							Pro tip: Add the Chrome extension to star articles from anywhere on the internet.
							{this.props.user.isEmailConfirmed ?
								<AsyncActionLink
									icon="email"
									onClick={this.props.onSendExtensionInstructions}
									text="Email me the link."
								/> :
								null}
						</p>
						<StarredScreen
							articles={this.state.articles.value}
							isUserSignedIn={!!this.props.user}
							onLoadPage={this._loadPage}
							onReadArticle={this.props.onReadArticle}
							onShareArticle={this.props.onShareArticle}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
						/>
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
		create: () => ({ key, title: 'Starred' }),
		render: (screenState: Screen, rootState: RootState) => (
			<AppStarredScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}