import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import HotTopicsList, { updateArticles } from '../controls/articles/HotTopicsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../AsyncTracker';
import { Screen, RootState } from '../Root';
import PageSelector from '../controls/PageSelector';

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
	private readonly _asyncTracker = new AsyncTracker();
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
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			}),
			props.onRegisterUserChangeHandler(() => {
				this._asyncTracker.cancelAll();
				this._loadPage(1);
			})
		);
	}
	private fetchHotTopics(pageNumber: number) {
		return this.props.onGetHotTopics(
			{ pageNumber, pageSize: 40 },
			this._asyncTracker.addCallback(hotTopics => {
				this.setState({ hotTopics });
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="home-screen_1sjipy">
				{this.state.hotTopics.isLoading ?
					<LoadingOverlay /> :
					<>
						<HotTopicsList
							aotd={this.state.hotTopics.value.aotd}
							articles={this.state.hotTopics.value.articles}
							isUserSignedIn={!!this.props.user}
							onReadArticle={this.props.onReadArticle}
							onShareArticle={this.props.onShareArticle}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
						/>
						<PageSelector
							pageNumber={this.state.hotTopics.value.articles.pageNumber}
							pageCount={this.state.hotTopics.value.articles.pageCount}
							onChange={this._loadPage}
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
		create: () => ({ key, title: 'Home' }),
		render: (screenState: Screen, rootState: RootState) => (
			<HomePage {...{ ...deps, user: rootState.user }} />
		)
	};
}