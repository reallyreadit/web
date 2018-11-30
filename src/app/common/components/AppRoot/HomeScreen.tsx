import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import HotTopicsList, { updateArticles } from '../controls/articles/HotTopicsList';
import logoText from '../../../../common/svg/logoText';
import Icon from '../../../../common/components/Icon';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../AsyncTracker';
import EmailConfirmationBar from '../EmailConfirmationBar';
import { Screen, RootState } from '../Root';
import AsyncActionLink from '../controls/AsyncActionLink';
import produce from 'immer';

interface Props {
	onGetHotTopics: FetchFunctionWithParams<{ pageNumber: number, pageSize: number }, HotTopics>,
	onOpenMenu: () => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onResendConfirmationEmail: () => Promise<void>,
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
	private readonly _loadMore = () => {
		return this._asyncTracker.addPromise(new Promise<void>((resolve, reject) => {
			this.props.onGetHotTopics(
				{
					pageNumber: this.state.hotTopics.value.articles.pageNumber + 1,
					pageSize: 10
				},
				this._asyncTracker.addCallback(hotTopics => {
					resolve();
					this.setState(produce<State>(state => {
						state.hotTopics.value.articles = {
							...hotTopics.value.articles,
							items: state.hotTopics.value.articles.items.concat(
								hotTopics.value.articles.items
							)
						}
					}));
				})
			)
		}));
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			hotTopics: props.onGetHotTopics(
				{ pageNumber: 1, pageSize: 10 },
				this._asyncTracker.addCallback(hotTopics => {
					this.setState({ hotTopics });
				})
			)
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="home-screen_an7vm5">
				<EmailConfirmationBar
					onResendConfirmationEmail={this.props.onResendConfirmationEmail}
					user={this.props.user}
				/>
				<div className="header">
					<div
						className="logo-container"
						dangerouslySetInnerHTML={{ __html: logoText }}
					></div>
					<Icon
						name="user"
						onClick={this.props.onOpenMenu}
					/>
				</div>
				{this.state.hotTopics.isLoading ?
					<LoadingOverlay position="static" /> :
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
						<AsyncActionLink
							text="Show more"
							onClick={this._loadMore}
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
		create: () => ({ key }),
		render: (screenState: Screen, rootState: RootState) => (
			<HomePage {...{ ...deps, user: rootState.user }} />
		)
	};
}