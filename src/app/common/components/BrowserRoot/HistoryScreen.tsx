import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import CallbackStore from '../../CallbackStore';
import EventHandlerStore from '../../EventHandlerStore';
import PageResult from '../../../../common/models/PageResult';
import HistoryScreen, { updateArticles } from '../screens/HistoryScreen';
import { Screen, RootState } from '../Root';

interface Props {
	onDeleteArticle: (article: UserArticle) => void,
	onGetUserArticleHistory: FetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>,
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
class BrowserHistoryScreen extends React.Component<Props, State> {
	private readonly _callbacks = new CallbackStore();
	private readonly _eventHandlers = new EventHandlerStore();
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
		this._eventHandlers.add(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			}),
			props.onRegisterUserChangeHandler(user => {
				this._callbacks.cancel();
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
		return this.props.onGetUserArticleHistory(
			{ pageNumber },
			this._callbacks.add(articles => {
				this.setState({ articles });
			})
		);
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
		this._eventHandlers.unregister();
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
			<BrowserHistoryScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}