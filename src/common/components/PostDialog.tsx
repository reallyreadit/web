import * as React from 'react';
import Dialog from './Dialog';
import RatingSelector from './RatingSelector';
import PostForm from '../models/social/PostForm';
import Post from '../models/social/Post';
import { Intent } from './Toaster';
import UserArticle from '../models/UserArticle';
import ActionLink from './ActionLink';
import MarkdownDialog from './MarkdownDialog';
import ToggleSwitchInput from './ToggleSwitchInput';
import UserAccount from '../models/UserAccount';

interface Props {
	article: UserArticle,
	onCloseDialog?: () => void,
	onOpenDialog: (dialog: React.ReactNode, method: 'push' | 'replace') => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSubmit: (form: PostForm) => Promise<Post>,
	user: UserAccount
}
interface State {
	commentText: string,
	ratingScore?: number,
	tweet: boolean
}
export default class PostDialog extends React.PureComponent<Props, State> {
	private readonly _changeCommentText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({
			commentText: event.currentTarget.value
		});
	};
	private readonly _changeRatingScore = (ratingScore?: number) => {
		this.setState({ ratingScore });
	};
	private readonly _changeTweet = (value: string, isEnabled: boolean) => {
		this.setState({
			tweet: isEnabled
		});
	};
	private readonly _openMarkdownDialog = () => {
		this.props.onOpenDialog(
			<MarkdownDialog
				onClose={this.props.onCloseDialog}
			/>,
			'push'
		);
	};
	private readonly _submit = () => {
		return this.props
			.onSubmit({
				articleId: this.props.article.id,
				ratingScore: this.state.ratingScore,
				commentText: this.state.commentText,
				tweet: this.state.tweet
			})
			.then(
				() => {
					this.props.onShowToast('Article Posted', Intent.Success);
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			commentText: '',
			ratingScore: props.article.ratingScore,
			tweet: props.user.hasLinkedTwitterAccount
		};
	}
	public render() {
		return (
			<Dialog
				className="post-dialog_to9nib"
				closeButtonText="Cancel"
				onClose={this.props.onCloseDialog}
				onSubmit={this._submit}
				title="Post Article"
			>
				<div className="rating">
					<RatingSelector
						allowDeselect={this.props.article.ratingScore == null}
						onChange={this._changeRatingScore}
						showLabels
						promptText="Would you recommend this article to others?"
						value={this.state.ratingScore}
					/>
				</div>
				<textarea
					onChange={this._changeCommentText}
					placeholder="Optional: Share your thoughts or ask a question."
					value={this.state.commentText}
				/>
				<ActionLink
					iconLeft="question-circle"
					onClick={this._openMarkdownDialog}
					text="Formatting Guide"
				/>
				<ToggleSwitchInput
					isEnabled={this.state.tweet}
					onChange={this._changeTweet}
					title="Tweet this post"
				/>
			</Dialog>
		);
	}
}