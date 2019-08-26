import * as React from 'react';
import Dialog from './Dialog';
import RatingSelector from './RatingSelector';
import PostForm from '../models/social/PostForm';
import Post from '../models/social/Post';
import { Intent } from './Toaster';

interface Props {
	articleId: number,
	onCloseDialog?: () => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSubmit: (form: PostForm) => Promise<Post>
}
export default class PostDialog extends React.PureComponent<
	Props,
	{
		commentText: string,
		ratingScore?: number
	}
> {
	private readonly _changeCommentText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({
			commentText: event.currentTarget.value
		});
	};
	private readonly _changeRatingScore = (ratingScore?: number) => {
		this.setState({ ratingScore });
	};
	private readonly _submit = () => {
		return this.props
			.onSubmit({
				articleId: this.props.articleId,
				ratingScore: this.state.ratingScore,
				commentText: this.state.commentText
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
			ratingScore: null
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
				<RatingSelector
					onChange={this._changeRatingScore}
					value={this.state.ratingScore}
				/>
				<textarea
					onChange={this._changeCommentText}
					placeholder="Optional: Share your thoughts or ask a question."
					value={this.state.commentText}
				/>
			</Dialog>
		);
	}
}