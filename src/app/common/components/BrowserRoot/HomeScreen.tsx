import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import HotTopicsList, { updateArticles } from '../controls/articles/HotTopicsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import CallbackStore from '../../CallbackStore';
import EventHandlerStore from '../../EventHandlerStore';
import { Screen, RootState } from '../Root';

interface Props {
	onGetHotTopics: FetchFunctionWithParams<{ pageNumber: number, pageSize: number }, HotTopics>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onRegisterUserChangeHandler: (handler: () => void) => Function,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	user: UserAccount | null
}
interface State {
	hotTopics: Fetchable<HotTopics>
}
class HomePage extends React.Component<Props, State> {
	private readonly _callbacks = new CallbackStore();
	private readonly _eventHandlers = new EventHandlerStore();
	private readonly _loadPage = (pageNumber: number) => {
		this.setState({
			hotTopics: this.fetchHotTopics(pageNumber)
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			hotTopics: this.fetchHotTopics(1)
		};
		this._eventHandlers.add(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			}),
			props.onRegisterUserChangeHandler(() => {
				this._callbacks.cancel();
				this._loadPage(1);
			})
		);
	}
	private fetchHotTopics(pageNumber: number) {
		return this.props.onGetHotTopics(
			{ pageNumber, pageSize: 40 },
			this._callbacks.add(hotTopics => {
				this.setState({ hotTopics });
			})
		);
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
		this._eventHandlers.unregister();
	}
	public render() {
		return (
			<div className="home-screen_1sjipy">
				{this.state.hotTopics.isLoading ?
					<LoadingOverlay /> :
					<HotTopicsList
						aotd={this.state.hotTopics.value.aotd}
						articles={this.state.hotTopics.value.articles}
						isUserSignedIn={!!this.props.user}
						onReadArticle={this.props.onReadArticle}
						onLoadPage={this._loadPage}
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
		create: () => ({ key, title: 'Home' }),
		render: (screenState: Screen, rootState: RootState) => (
			<HomePage {...{ ...deps, user: rootState.user }} />
		)
	};
}