import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import CallbackStore from '../../CallbackStore';
import EventHandlerStore from '../../EventHandlerStore';
import PageResult from '../../../../common/models/PageResult';
import StarredScreen, { updateArticles } from '../screens/StarredScreen';

interface Props {
	onGetStarredArticles: FetchFunctionWithParams<{ pageNumber: number }, PageResult<UserArticle>>,
	onGetUser: () => UserAccount | null,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>
}
class AppStarredScreen extends React.Component<Props, State> {
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
			articles: this.fetchArticles(1)
		};
		this._eventHandlers.add(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			})
		);
	}
	private fetchArticles(pageNumber: number) {
		return this.props.onGetStarredArticles(
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
			<StarredScreen
				articles={this.state.articles}
				isUserSignedIn={!!this.props.onGetUser()}
				onLoadPage={this._loadPage}
				onReadArticle={this.props.onReadArticle}
				onShareArticle={this.props.onShareArticle}
				onToggleArticleStar={this.props.onToggleArticleStar}
				onViewComments={this.props.onViewComments}
			/>
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