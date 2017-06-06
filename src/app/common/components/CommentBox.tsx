import * as React from 'react';
import Button from '../../../common/components/Button';
import ContextComponent from '../ContextComponent';
import Context from '../Context';
import Comment from '../../../common/models/Comment';

interface Props {
    articleId: string,
    parentCommentId?: string,
    isAllowedToPost: boolean,
    onCommentPosted: (comment: Comment) => void,
    onCancel?: () => void
}
export default class CommentBox extends ContextComponent<Props, {
    commentText: string,
    isPosting: boolean
}> {
	private _updateCommentText = (event: React.FormEvent<HTMLTextAreaElement>) => this.setState({ commentText: (event.target as HTMLTextAreaElement).value });
	private _postComment = () => {
		this.setState({ isPosting: true });
		this.context.api
			.postComment(this.state.commentText, this.props.articleId, this.props.parentCommentId)
			.then(comment => {
				this.setState({
					commentText: '',
					isPosting: false
				});
				this.props.onCommentPosted(comment);
			});
	};
    constructor(props: Props, context: Context) {
        super(props, context);
        this.state = {
            commentText: '',
            isPosting: false
        };
    }
    public render() {
        return (
            <div className="comment-box">
                <textarea value={this.state.commentText} onChange={this._updateCommentText} autoFocus={!!this.props.parentCommentId} />
                <br />
                {this.props.articleId && !this.props.isAllowedToPost ?
                    <span>You have to read the article before you can comment!</span> :
                    null}
                {this.props.onCancel ?
                    <Button text="Cancel" iconLeft="forbid" onClick={this.props.onCancel} /> :
                    null}
                <Button text={`Post ${this.props.parentCommentId ? 'Reply' : 'Comment'}`} iconLeft="checkmark" style="preferred" state={this.state.isPosting ? 'busy' : this.props.isAllowedToPost ? 'normal' : 'disabled'} onClick={this._postComment} />
            </div>
        );
    }
}