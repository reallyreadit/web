import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../AsyncTracker';
import PageResult from '../../../../common/models/PageResult';
import HistoryScreen, { updateArticles } from '../screens/HistoryScreen';
import { Screen, RootState } from '../Root';

interface Props {
	onDeleteArticle: (article: UserArticle) => void,
	onGetUserArticleHistory: FetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	user: UserAccount | null
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>
}
class AppHistoryScreen extends React.Component<Props, State> {
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
		return this.props.onGetUserArticleHistory(
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
			<HistoryScreen
				articles={this.state.articles}
				isUserSignedIn={!!this.props.user}
				onDeleteArticle={this.props.onDeleteArticle}
				onLoadPage={this._loadPage}
				onReadArticle={this.props.onReadArticle}
				onShareArticle={this.props.onShareArticle}
				onToggleArticleStar={this.props.onToggleArticleStar}
				onViewComments={this.props.onViewComments}
			/>
		);
	}
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: () => ({ key, title: 'History' }),
		render: (screenState: Screen, rootState: RootState) => (
			<AppHistoryScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}