import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../../../common/Fetchable';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserAccount from '../../../../common/models/UserAccount';
import CommentsScreen, { getPathParams, Props as CommentScreenProps } from '../screens/CommentsScreen';
import { Screen, TemplateSection } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';
import CommentThread from '../../../../common/models/CommentThread';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import { SharedState } from '../BrowserRoot';
import { formatFetchable, formatPossessive } from '../../../../common/format';
import OnboardingScreen from './OnboardingScreen';
import { mergeComment, findComment } from '../../../../common/comments';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import CommentForm from '../../../../common/models/social/CommentForm';

function shouldShowComments(
	user: UserAccount | null,
	isExtensionInstalled: boolean | null,
	hasDeclinedExtensionInstallPrompt?: boolean
) {
	return (
		!!user &&
		(
			isExtensionInstalled === true ||
			hasDeclinedExtensionInstallPrompt === true
		)
	);
}
interface Props extends Pick<CommentScreenProps, Exclude<keyof CommentScreenProps, 'comments' | 'onPostComment'>> {
	articleSlug: string,
	isBrowserCompatible: boolean | null,
	isExtensionInstalled: boolean | null,
	onCopyAppReferrerTextToClipboard: () => void,
	onGetComments: FetchFunctionWithParams<{ slug: string }, CommentThread[]>,
	onInstallExtension: () => void,
	onPostArticle: (article: UserArticle) => void,
	onPostComment: (form: CommentForm) => Promise<CommentThread>,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onRegisterCommentPostedHandler: (handler: (comment: CommentThread) => void) => Function,
	onRegisterExtensionChangeHandler: (handler: (isInstalled: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: (user: UserAccount | null) => void) => Function,
	onReloadArticle: (screenId: number, slug: string) => void,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen<Fetchable<UserArticle>>>) => Partial<Screen<Fetchable<UserArticle>>>) => void,
	onShowCreateAccountDialog: () => void,
	onShowSignInDialog: () => void,
	onViewHomeScreen: () => void,
	screenId: number
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
					this.props.onSetScreenState(this.props.screenId, produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.templateSection = shouldShowComments(
								this.props.user,
								this.props.isExtensionInstalled,
								true
							) ?
								null :
								TemplateSection.None;
					}));
				}
			}
		>
			Skip
		</a>
	);
	private readonly _postComment = (form: CommentForm) => {
		return this.props
			.onPostComment(form)
			.then(() => { });
	};
	constructor(props: Props) {
		super(props);
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(event => {
				if (this.props.article.value && this.props.article.value.id === event.article.id) {
					this.props.onSetScreenState(this.props.screenId, produce<Screen<Fetchable<UserArticle>>>(currentState => {
						currentState.componentState.value = event.article;
					}));
				}
			}),
			props.onRegisterCommentPostedHandler(comment => {
				if (this.props.article.value && this.props.article.value.id === comment.articleId && this.state.comments.value) {
					this.setState({
						comments: {
							...this.state.comments,
							value: mergeComment(comment, this.state.comments.value)
						}
					});
				}
			}),
			props.onRegisterExtensionChangeHandler(isExtensionInstalled => {
				this.props.onSetScreenState(this.props.screenId, produce<Screen<Fetchable<UserArticle>>>(currentState => {
					currentState.templateSection = shouldShowComments(
							this.props.user,
							isExtensionInstalled,
							this.state.hasDeclinedExtensionInstallPrompt
						) ?
							null :
							TemplateSection.None;
				}));
			}),
			props.onRegisterUserChangeHandler(user => {
				this.props.onReloadArticle(this.props.screenId, this.props.articleSlug);
				this.props.onSetScreenState(this.props.screenId, produce<Screen<Fetchable<UserArticle>>>(currentState => {
					currentState.templateSection = shouldShowComments(
							user,
							this.props.isExtensionInstalled,
							this.state.hasDeclinedExtensionInstallPrompt
						) ?
							null :
							TemplateSection.None;
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
				if (comment) {
					description = `${formatPossessive(comment.userAccount)} comment on "${comment.articleTitle}"`;
				} else {
					description = `Comments on "${this.props.article.value.title}"`;
				}
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
type Dependencies<TScreenKey> = Pick<Props, Exclude<keyof Props, 'article' | 'articleSlug' | 'highlightedCommentId' | 'isExtensionInstalled' | 'onReloadArticle' | 'screenId' | 'user'>> & {
	onGetArticle: FetchFunctionWithParams<{ slug: string }, UserArticle>
};
export default function createScreenFactory<TScreenKey>(key: TScreenKey, deps: Dependencies<TScreenKey>) {
	const reloadArticle = (screenId: number, slug: string) => {
		deps.onGetArticle({ slug }, article => {
			deps.onSetScreenState(screenId, produce<Screen<Fetchable<UserArticle>>>(currentState => {
				currentState.componentState = article;
			}));
		});
	};
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const
				pathParams = getPathParams(location),
				article = deps.onGetArticle({ slug: pathParams.slug }, article => {
					deps.onSetScreenState(
						id,
						produce<Screen<Fetchable<UserArticle>>>(currentState => {
							currentState.componentState = article;
							currentState.title = article.value.title;
						})
					);
				});
			return {
				id,
				componentState: article,
				key,
				location,
				templateSection: shouldShowComments(sharedState.user, sharedState.isExtensionInstalled) ? null : TemplateSection.None,
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
							screenId: state.id
						}
					}
				/>
			);
		}
	};
}