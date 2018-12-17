import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CommentsScreen, { getPathParams } from '../screens/CommentsScreen';
import { Screen, SharedState } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import Comment from '../../../../common/models/Comment';
import AsyncTracker from '../../../../common/AsyncTracker';
import VerificationTokenData from '../../../../common/models/VerificationTokenData';
import produce from 'immer';

interface Props {
	location: RouteLocation,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onGetComments: FetchFunctionWithParams<{ proofToken?: string, slug?: string }, Comment[]>,
	onPostComment: (text: string, articleId: number, parentCommentId?: number) => Promise<Comment>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onRegisterUserChangeHandler: (handler: () => void) => Function,
	onReloadArticle: (params: { proofToken?: string, slug?: string }) => void,
	onSetScreenState: (getNextState: (currentState: Readonly<Screen<Fetchable<VerificationTokenData>>>) => Partial<Screen<Fetchable<VerificationTokenData>>>) => void,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	tokenData: Fetchable<VerificationTokenData>,
	user: UserAccount | null
}
class BrowserCommentsScreen extends React.Component<Props> {
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
			}),
			props.onRegisterUserChangeHandler(() => {
				this.props.onReloadArticle(getPathParams(props.location));
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
				onReadArticle={this.props.onReadArticle}
				onShareArticle={this.props.onShareArticle}
				onToggleArticleStar={this.props.onToggleArticleStar}
				tokenData={this.props.tokenData}
				user={this.props.user}
			/>
		);
	}
}
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'location' | 'onReloadArticle' | 'onSetScreenState' | 'tokenData' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ proofToken?: string, slug?: string }, UserArticle>,
	onGetVerificationTokenData: FetchFunctionWithParams<{ token: string }, VerificationTokenData>,
	onSetScreenState: (key: TScreenKey, getNextState: (currentState: Readonly<Screen<Fetchable<VerificationTokenData>>>) => Partial<Screen<Fetchable<VerificationTokenData>>>) => void
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const setScreenState = (getNextState: (currentState: Readonly<Screen<Fetchable<VerificationTokenData>>>) => Partial<Screen<Fetchable<VerificationTokenData>>>) => {
		deps.onSetScreenState(key, getNextState);
	};
	const reloadArticle = (params: { proofToken?: string, slug?: string }) => {
		deps.onGetArticle(params, article => {
			setScreenState(produce<Screen<Fetchable<VerificationTokenData>>>(currentState => {
				currentState.componentState.value.article = article.value;
			}));
		});
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
			<BrowserCommentsScreen
				location={state.location}
				onCopyTextToClipboard={deps.onCopyTextToClipboard}
				onCreateAbsoluteUrl={deps.onCreateAbsoluteUrl}
				onGetComments={deps.onGetComments}
				onPostComment={deps.onPostComment}
				onReadArticle={deps.onReadArticle}
				onRegisterArticleChangeHandler={deps.onRegisterArticleChangeHandler}
				onRegisterUserChangeHandler={deps.onRegisterUserChangeHandler}
				onReloadArticle={reloadArticle}
				onSetScreenState={setScreenState}
				onShareArticle={deps.onShareArticle}
				onToggleArticleStar={deps.onToggleArticleStar}
				tokenData={state.componentState}
				user={sharedState.user}
			/>
		)
	};
}