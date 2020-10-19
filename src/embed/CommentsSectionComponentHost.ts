import { DomAttachmentDelegate } from '../common/shadowDom/ComponentHost';
import EmbedCommentsSection, { Props as CommentsSectionProps } from './components/EmbedCommentsSection';
import CommentThread from '../common/models/CommentThread';
import { updateComment, mergeComment } from '../common/comments';
import EmbedComponentHost from './EmbedComponentHost';
import { createCommentThread } from '../common/models/social/Post';
import CommentForm from '../common/models/social/CommentForm';
import CommentCreationResponse from '../common/models/social/CommentCreationResponse';

type Services = Pick<
	CommentsSectionProps,
	'clipboardService' | 'dialogService' | 'onAuthenticationRequired' | 'onCreateAbsoluteUrl' | 'onDeleteComment' | 'onLinkAuthServiceAccount' | 'onNavTo' | 'onPostArticle' | 'onPostComment' | 'onPostCommentAddendum' | 'onPostCommentRevision' | 'onShare' | 'onViewProfile' | 'toasterService'
>;
type State = Pick<
	CommentsSectionProps,
	'article' | 'comments' | 'user'
>;
export default class CommentsSectionComponentHost extends EmbedComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<CommentsSectionProps> | React.ComponentClass<CommentsSectionProps>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Pick<Services, Exclude<keyof Services, 'onPostComment'>> & {
				onPostComment: (form: CommentForm) => Promise<CommentCreationResponse>
			},
			state: State
		}
	) {
		super(params);
		this._component = EmbedCommentsSection;
		this._services = {
			...params.services,
			onDeleteComment: form => params.services
				.onDeleteComment(form)
				.then(
					comment => {
						this.commentUpdated(comment);
						return comment;
					}
				),
			onPostArticle: form => params.services
				.onPostArticle(form)
				.then(
					post => {
						if (post.comment) {
							this.commentPosted(
								createCommentThread(post)
							);
						}
						return post;
					}
				),
			onPostComment: form => params.services
				.onPostComment(form)
				.then(
					res => {
						this.commentPosted(res.comment);
					}
				),
			onPostCommentAddendum: form => params.services
				.onPostCommentAddendum(form)
				.then(
					comment => {
						this.commentUpdated(comment);
						return comment;
					}
				),
			onPostCommentRevision: form => params.services
				.onPostCommentRevision(form)
				.then(
					comment => {
						this.commentUpdated(comment);
						return comment;
					}
				)
		};
		this.setState(params.state);
	}
	public commentPosted(comment: CommentThread) {
		if (this._state.comments.isLoading) {
			return;
		}
		this.setState({
			comments: {
				...this._state.comments,
				value: mergeComment(comment, this._state.comments.value)
			}
		});
	}
	public commentUpdated(comment: CommentThread) {
		if (this._state.comments.isLoading) {
			return;
		}
		this.setState({
			comments: {
				...this._state.comments,
				value: updateComment(comment, this._state.comments.value)
			}
		});
	}
}