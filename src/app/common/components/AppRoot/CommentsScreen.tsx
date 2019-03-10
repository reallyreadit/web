import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CommentsScreen, { getPathParams } from '../screens/CommentsScreen';
import { Screen, SharedState } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import Rating from '../../../../common/models/Rating';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';

interface Props {
	article: Fetchable<UserArticle>,
	location: RouteLocation,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<CommentThread>,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onSetScreenState: (getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	user: UserAccount | null
}
class AppCommentsScreen extends React.Component<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				if (this.props.article.value && this.props.article.value.id === updatedArticle.id) {
					this.props.onSetScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.componentState.value = updatedArticle;
					}));
				}
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<CommentsScreen
				article={this.props.article}
				location={this.props.location}
				onCopyTextToClipboard={this.props.onCopyTextToClipboard}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onGetComments={this.props.onGetComments}
				onPostComment={this.props.onPostComment}
				onRateArticle={this.props.onRateArticle}
				onReadArticle={this.props.onReadArticle}
				onShare={this.props.onShare}
				onToggleArticleStar={this.props.onToggleArticleStar}
				user={this.props.user}
			/>
		);
	}
}
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'article' | 'location' | 'onSetScreenState' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onSetScreenState: (key: TScreenKey, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const setScreenState = (getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => {
		deps.onSetScreenState(key, getNextState);
	};
	return {
		create: (location: RouteLocation) => {
			const
				pathParams = getPathParams(location),
				article = deps.onGetArticle({ slug: pathParams.slug }, article => {
					setScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.componentState = article;
						currentState.title = article.value.title;
					}));
				});
			return {
				key,
				location,
				componentState: article,
				title: article.value ? article.value.title : 'Loading...'
			};
		},
		render: (state: Screen<Fetchable<UserArticle>>, sharedState: SharedState) => (
			<AppCommentsScreen
				article={state.componentState}
				location={state.location}
				onCopyTextToClipboard={deps.onCopyTextToClipboard}
				onCreateAbsoluteUrl={deps.onCreateAbsoluteUrl}
				onGetComments={deps.onGetComments}
				onPostComment={deps.onPostComment}
				onRateArticle={deps.onRateArticle}
				onReadArticle={deps.onReadArticle}
				onRegisterArticleChangeHandler={deps.onRegisterArticleChangeHandler}
				onSetScreenState={setScreenState}
				onShare={deps.onShare}
				onToggleArticleStar={deps.onToggleArticleStar}
				user={sharedState.user}
			/>
		)
	};
}