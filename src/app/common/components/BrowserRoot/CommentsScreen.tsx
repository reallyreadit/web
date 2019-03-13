import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CommentsScreen, { getPathParams, mergeComment, Props as CommentScreenProps, findComment } from '../screens/CommentsScreen';
import { Screen } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import { SharedState } from '../BrowserRoot';
import { formatFetchable } from '../../../../common/format';
import OnboardingScreen from './OnboardingScreen';

function shouldShowComments(
	highlightedCommentId: string | null,
	user: UserAccount | null,
	isExtensionInstalled: boolean | null,
	hasDeclinedExtensionInstallPrompt?: boolean
) {
	return (
		!highlightedCommentId ||
		(
			!!user &&
			(
				isExtensionInstalled === true ||
				hasDeclinedExtensionInstallPrompt === true
			)
		)
	);
}
interface Props extends Pick<CommentScreenProps, Exclude<keyof CommentScreenProps, 'comments' | 'onPostComment'>> {
	articleSlug: string,
	isBrowserCompatible: boolean | null,
	isExtensionInstalled: boolean | null,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onInstallExtension: () => void,
	onPostComment: (text: string, articleId: number, parentCommentId?: string) => Promise<CommentThread>,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onRegisterExtensionChangeHandler: (handler: (isInstalled: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onReloadArticle: (slug: string) => void,
	onSetScreenState: (getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	onViewHomeScreen: () => void
}
class BrowserCommentsScreen extends React.Component<
	Props,
	{
		comments: Fetchable<CommentThread[]>,
		hasDeclinedExtensionInstallPrompt: boolean
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _declineExtensionInstallLink = (
		<a
			onClick={
				() => {
					this.setState({ hasDeclinedExtensionInstallPrompt: true });
					this.props.onSetScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.renderTemplate = shouldShowComments(
							this.props.highlightedCommentId,
							this.props.user,
							this.props.isExtensionInstalled,
							true
						);
					}));
				}
			}
		>
			Skip
		</a>
	);
	private readonly _postComment = (text: string, articleId: number, parentCommentId?: string) => {
		return this.props
			.onPostComment(text, articleId, parentCommentId)
			.then(comment => {
				this.setState({
					comments: {
						...this.state.comments,
						value: mergeComment(comment, this.state.comments.value.slice())
					}
				});
			});
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				if (this.props.article.value && this.props.article.value.id === updatedArticle.id) {
					this.props.onSetScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.componentState.value = updatedArticle;
					}));
				}
			}),
			props.onRegisterExtensionChangeHandler(isExtensionInstalled => {
				this.props.onSetScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
					currentState.renderTemplate = shouldShowComments(
						this.props.highlightedCommentId,
						this.props.user,
						isExtensionInstalled,
						this.state.hasDeclinedExtensionInstallPrompt
					);
				}));
			}),
			props.onRegisterUserChangeHandler(user => {
				this.props.onReloadArticle(this.props.articleSlug);
				this.props.onSetScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
					currentState.renderTemplate = shouldShowComments(
						this.props.highlightedCommentId,
						user,
						this.props.isExtensionInstalled,
						this.state.hasDeclinedExtensionInstallPrompt
					);
				}));
			})
		);
		this.state = {
			comments: this.props.onGetComments(
				{ slug: this.props.articleSlug },
				this._asyncTracker.addCallback(comments => {
					this.setState({ comments });
				})
			),
			hasDeclinedExtensionInstallPrompt: false
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		let screen: React.ReactNode;
		if (
			shouldShowComments(
				this.props.highlightedCommentId,
				this.props.user,
				this.props.isExtensionInstalled,
				this.state.hasDeclinedExtensionInstallPrompt
			)
		) {
			screen = (
				<CommentsScreen
					{
					...{
						...this.props,
						comments: this.state.comments,
						onPostComment: this._postComment
					}
					}
				/>
			);
		} else {
			let description: string;
			if (this.props.article.value && this.state.comments.value) {
				const comment = findComment(this.props.highlightedCommentId, this.state.comments.value);
				description = `Taking you to ${comment.userAccount}'${comment.userAccount.endsWith('s') ? '' : 's'} comment on ${comment.articleTitle}`;
			} else {
				description = 'Loading...';
			}
			screen = (
				<OnboardingScreen
					{
					...{
						...this.props,
						description,
						extensionBypass: this._declineExtensionInstallLink,
						unsupportedBypass: this._declineExtensionInstallLink
					}
					}
				/>
			);
		}
		return screen;
	}
}
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'article' | 'articleSlug' | 'highlightedCommentId' | 'isExtensionInstalled' | 'onReloadArticle' | 'onSetScreenState' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>,
	onSetScreenState: (key: TScreenKey, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const setScreenState = (getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => {
		deps.onSetScreenState(key, getNextState);
	};
	const reloadArticle = (slug: string) => {
		deps.onGetArticle({ slug }, article => {
			setScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
				currentState.componentState = article;
			}));
		});
	};
	return {
		create: (location: RouteLocation, sharedState: SharedState) => {
			const
				pathParams = getPathParams(location),
				article = deps.onGetArticle({ slug: pathParams.slug }, article => {
					setScreenState(produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.componentState = article;
						currentState.title = article.value.title;
					}));
				});
			return {
				componentState: article,
				key,
				location,
				renderTemplate: shouldShowComments(pathParams.commentId, sharedState.user, sharedState.isExtensionInstalled),
				title: formatFetchable(article, article => article.title, 'Loading...')
			};
		},
		render: (state: Screen<Fetchable<UserArticle>>, sharedState: SharedState) => {
			const pathParams = getPathParams(state.location);
			return (
				<BrowserCommentsScreen
					{
						...{
							...deps,
							...sharedState,
							article: state.componentState,
							articleSlug: pathParams.slug,
							highlightedCommentId: pathParams.commentId,
							onReloadArticle: reloadArticle,
							onSetScreenState: setScreenState
						}
					}
				/>
			);
		}
	};
}