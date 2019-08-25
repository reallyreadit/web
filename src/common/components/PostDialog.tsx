import * as React from 'react';
import Dialog from './Dialog';
import RatingSelector from './RatingSelector';
import Button from './Button';
import PostForm from '../models/social/PostForm';
import Post from '../models/social/Post';

interface Props {
	articleId: number,
	onCloseDialog?: () => void,
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
				onClose={this.props.onCloseDialog}
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
				<div className="buttons">
					<Button
						text="Submit"
						style="preferred"
					/>
				</div>
			</Dialog>
		);
	}
}