import { DomAttachmentDelegate } from '../../../common/shadowDom/ComponentHost';
import BrowserCommentsSection, { Props as CommentsSectionProps } from './components/BrowserCommentsSection';
import CommentThread from '../../../common/models/CommentThread';
import { updateComment, mergeComment } from '../../../common/comments';
import UserArticle from '../../../common/models/UserArticle';
import UserAccount from '../../../common/models/UserAccount';
import ExtensionComponentHost from './ExtensionComponentHost';

type Services = Pick<CommentsSectionProps, 'clipboardService' | 'dialogService' | 'onCreateAbsoluteUrl' | 'onDeleteComment' | 'onLinkAuthServiceAccount' | 'onNavTo' | 'onPostArticle' | 'onPostComment' | 'onPostCommentAddendum' | 'onPostCommentRevision' | 'onShare' | 'onViewProfile' | 'toasterService'>;
type State = Pick<CommentsSectionProps, 'article' | 'comments' | 'user'>;
export default class CommentsSectionComponentHost extends ExtensionComponentHost<Services, State> {
	protected readonly _component: React.FunctionComponent<Services & State> | React.ComponentClass<Services & State>;
	protected readonly _services: Services;
	protected _state: State;
	constructor(
		params: {
			domAttachmentDelegate: DomAttachmentDelegate,
			services: Services
		}
	) {
		super(params);
		this._component = BrowserCommentsSection;
		this._services = params.services;
	}
	public get isInitialized() {
		return this._state != null;
	}
	public articleUpdated(article: UserArticle) {
		if (this.isInitialized) {
			this.setState({
				article
			});
		}	
	}
	public commentPosted(comment: CommentThread) {
		if (this.isInitialized && !this._state.comments.isLoading) {
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
		if (this.isInitialized && !this._state.comments.isLoading) {
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
		if (this.isInitialized) {
			this.setState({
				user
			});
		}
	}
}