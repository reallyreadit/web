import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import HotTopicsList, { updateArticles } from '../HotTopicsList';
import logoText from '../../../../common/svg/logoText';
import Icon from '../../../../common/components/Icon';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import CallbackStore from '../../CallbackStore';
import EventHandlerStore from '../../EventHandlerStore';

interface Props {
	onGetHotTopics: FetchFunctionWithParams<{ pageNumber: number, pageSize: number }, HotTopics>,
	onGetUser: () => UserAccount | null,
	onOpenMenu: () => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void
}
interface State {
	hotTopics: Fetchable<HotTopics>
}
class HomePage extends React.Component<Props, State> {
	private readonly _callbacks = new CallbackStore();
	private readonly _eventHandlers = new EventHandlerStore();
	constructor(props: Props) {
		super(props);
		this.state = {
			hotTopics: props.onGetHotTopics(
				{ pageNumber: 1, pageSize: 10 },
				this._callbacks.add(hotTopics => {
					this.setState({ hotTopics });
				})
			)
		};
		this._eventHandlers.add(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			})
		);
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
		this._eventHandlers.unregister();
	}
	public render() {
		return (
			<div className="home-page_3aivep">
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
					<HotTopicsList
						aotd={this.state.hotTopics.value.aotd}
						articles={this.state.hotTopics.value.articles}
						isUserSignedIn={!!this.props.onGetUser()}
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
	deps: Props
) {
	return {
		create: () => ({ key }),
		render: () => (
			<HomePage {...deps} />
		)
	};
}