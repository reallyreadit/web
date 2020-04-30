import ComponentHost, { DomAttachmentDelegate } from './ComponentHost';
import BrowserCommentsSection, { Props as CommentsSectionProps } from './components/BrowserCommentsSection';
import CommentThread from '../../../common/models/CommentThread';
import { createCommentThread } from '../../../common/models/social/Post';
import CommentForm from '../../../common/models/social/CommentForm';
import { updateComment, mergeComment } from '../../../common/comments';
import UserArticle from '../../../common/models/UserArticle';
import UserAccount from '../../../common/models/UserAccount';

type Services = Pick<CommentsSectionProps, 'clipboardService' | 'dialogService' | 'onCreateAbsoluteUrl' | 'onDeleteComment' | 'onLinkAuthServiceAccount' | 'onNavTo' | 'onPostArticle' | 'onPostComment' | 'onPostCommentAddendum' | 'onPostCommentRevision' | 'onShare' | 'onViewProfile' | 'toasterService'>;
type State = Pick<CommentsSectionProps, 'article' | 'comments' | 'user'>;
export default class CommentsSectionComponentHost extends ComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<Services & State> | React.ComponentClass<Services & State>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Pick<Services, Exclude<keyof Services, 'onPostComment'>>  & {
				onPostComment: (form: CommentForm) => Promise<{
					article: UserArticle,
					comment: CommentThread
				}>
			}
		}
	) {
		super(params);
		this._component = BrowserCommentsSection;
		this._services = {
			...params.services,
			onDeleteComment: form => params.services
				.onDeleteComment(form)
				.then(
					comment => {
						this.setState({
							comments: {
								...this._state.comments,
								value: updateComment(comment, this._state.comments.value)
							}
						});
						return comment;
					}
				),
			onPostArticle: form => params.services
				.onPostArticle(form)
				.then(
					post => {
						if (post.comment) {
							this.setState({
								article: post.article,
								comments: {
									...this._state.comments,
									value: mergeComment(
										createCommentThread(post),
										this._state.comments.value
									)
								}
							});
						} else {
							this.setState({
								article: post.article
							});
						}
						return post;
					}
				),
			onPostComment: form => params.services
				.onPostComment(form)
				.then(
					result => {
						this.setState({
							article: result.article,
							comments: {
								...this._state.comments,
								value: mergeComment(result.comment, this._state.comments.value)
							}
						});
						return null;
					}
				),
			onPostCommentAddendum: form => params.services
				.onPostCommentAddendum(form)
				.then(
					comment => {
						this.setState({
							comments: {
								...this._state.comments,
								value: updateComment(comment, this._state.comments.value)
							}
						});
						return comment;
					}
				),
			onPostCommentRevision: form => params.services
				.onPostCommentRevision(form)
				.then(
					comment => {
						this.setState({
							comments: {
								...this._state.comments,
								value: updateComment(comment, this._state.comments.value)
							}
						});
						return comment;
					}
				)
		};
	}
	public articleUpdated(article: UserArticle) {
		if (this._state) {
			this.setState({
				article
			});
		}	
	}
	public commentPosted(comment: CommentThread) {
		if (this._state && !this._state.comments.isLoading) {
			this.setState({
				comments: {
					...this._state.comments,
					value: mergeComment(comment, this._state.comments.value)
				}
			});
		}
	}
	public commentsLoaded(comments: CommentThread[]) {
		this.setState({
			comments: {
				isLoading: false,
				value: comments
			}
		});
	}
	public commentUpdated(comment: CommentThread) {
		if (this._state && !this._state.comments.isLoading) {
			this.setState({
				comments: {
					...this._state.comments,
					value: updateComment(comment, this._state.comments.value)
				}
			});
		}
	}
	public initialize(article: UserArticle, user: UserAccount) {
		this.setState({
			article,
			comments: {
				isLoading: true
			},
			user
		});
		return this;
	}
	public userUpdated(user: UserAccount) {
		if (this._state) {
			this.setState({
				user
			});
		}
	}
}