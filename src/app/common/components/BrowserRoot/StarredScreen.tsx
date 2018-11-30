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

interface Props {
	onGetStarredArticles: FetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	user: UserAccount | null
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>
}
const emptyPageResult = {
	isLoading: false,
	value: {
		items: [] as UserArticle[],
		pageCount: 0,
		pageNumber: 0,
		pageSize: 0,
		totalCount: 0
	}
};
class BrowserStarredScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _loadPage = (pageNumber: number) => {
		this.setState({
			articles: this.fetchArticles(pageNumber)
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			articles: props.user ?
				this.fetchArticles(1) :
				emptyPageResult
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			}),
			props.onRegisterUserChangeHandler(user => {
				this._asyncTracker.cancelAll();
				if (user) {
					this._loadPage(1);
				} else {
					this.setState({
						articles: emptyPageResult
					});
				}
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
			<div className="starred-screen_8khrr8">
				{this.state.articles.isLoading ?
					<LoadingOverlay /> :
					<StarredScreen
						articles={this.state.articles.value}
						isUserSignedIn={!!this.props.user}
						onLoadPage={this._loadPage}
						onReadArticle={this.props.onReadArticle}
						onShareArticle={this.props.onShareArticle}
						onToggleArticleStar={this.props.onToggleArticleStar}
						onViewComments={this.props.onViewComments}
					/>}
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
			<BrowserStarredScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}