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
import VerificationTokenData from '../../../../common/models/VerificationTokenData';
import produce from 'immer';
import Rating from '../../../../common/models/Rating';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import ShareData from '../../../../common/sharing/ShareData';

interface Props {
	location: RouteLocation,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetComments: FetchFunctionWithParams<{ proofToken?: string, slug?: string }, CommentThread[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<CommentThread>,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onSetScreenState: (getNextState: (currentState: Readonly<Screen<Fetchable<VerificationTokenData>>>) => Partial<Screen<Fetchable<VerificationTokenData>>>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	tokenData: Fetchable<VerificationTokenData>,
	user: UserAccount | null
}
class AppCommentsScreen extends React.Component<Props> {
	private readonly _asyncTracker = new AsyncTracker();
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				if (this.props.tokenData.value && this.props.tokenData.value.article.id === updatedArticle.id) {
					this.props.onSetScreenState(produce<Screen<Fetchable<VerificationTokenData>>>(currentState => {
						currentState.componentState.value.article = updatedArticle;
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
				location={this.props.location}
				onCopyTextToClipboard={this.props.onCopyTextToClipboard}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onGetComments={this.props.onGetComments}
				onPostComment={this.props.onPostComment}
				onRateArticle={this.props.onRateArticle}
				onReadArticle={this.props.onReadArticle}
				onShare={this.props.onShare}
				onToggleArticleStar={this.props.onToggleArticleStar}
				tokenData={this.props.tokenData}
				user={this.props.user}
			/>
		);
	}
}
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'location' | 'onSetScreenState' | 'tokenData' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ proofToken?: string, slug?: string }, UserArticle>,
	onGetVerificationTokenData: FetchFunctionWithParams<{ token: string }, VerificationTokenData>,
	onSetScreenState: (key: TScreenKey, getNextState: (currentState: Readonly<Screen<Fetchable<VerificationTokenData>>>) => Partial<Screen<Fetchable<VerificationTokenData>>>) => void
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const setScreenState = (getNextState: (currentState: Readonly<Screen<Fetchable<VerificationTokenData>>>) => Partial<Screen<Fetchable<VerificationTokenData>>>) => {
		deps.onSetScreenState(key, getNextState);
	};
	return {
		create: (location: RouteLocation) => {
			let tokenData: Fetchable<VerificationTokenData>;
			const pathParams = getPathParams(location);
			if ('proofToken' in pathParams) {
				tokenData = deps.onGetVerificationTokenData({ token: pathParams.proofToken }, data => {
					setScreenState(produce<Screen<Fetchable<VerificationTokenData>>>(currentState => {
						currentState.componentState.isLoading = false;
						currentState.componentState.value = data.value;
						currentState.title = data.value.article.title;
					}));
				});
			} else {
				const article = deps.onGetArticle({ slug: pathParams.slug }, article => {
					setScreenState(produce<Screen<Fetchable<VerificationTokenData>>>(currentState => {
						currentState.componentState.isLoading = false;
						currentState.componentState.value = {
							article: article.value,
							readerName: null
						};
						currentState.title = article.value.title;
					}));
				});
				if (article.isLoading) {
					tokenData = { isLoading: true };
				} else {
					tokenData = {
						isLoading: false,
						value: {
							article: article.value,
							readerName: null
						}
					};
				}
			}
			return {
				key,
				location,
				componentState: tokenData,
				title: tokenData.value ? tokenData.value.article.title : 'Loading...'
			};
		},
		render: (state: Screen<Fetchable<VerificationTokenData>>, sharedState: SharedState) => (
			<AppCommentsScreen
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
				tokenData={state.componentState}
				user={sharedState.user}
			/>
		)
	};
}