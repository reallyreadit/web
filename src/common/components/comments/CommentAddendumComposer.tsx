import * as React from 'react';
import CommentAddendumForm from '../../models/social/CommentAddendumForm';
import CommentThread from '../../models/CommentThread';
import Button from '../Button';
import { DateTime } from 'luxon';
import ActionLink from '../ActionLink';
import MarkdownDialog from '../MarkdownDialog';

interface Props {
	comment: CommentThread,
	onClose: () => void,
	onCloseDialog: () => void,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onPostAddendum: (form: CommentAddendumForm) => Promise<CommentThread>
}
export default class CommentAddendumComposer extends React.PureComponent<
	Props,
	{
		isPosting: boolean,
		text: string
	}
> {
	private readonly _changeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({ text: event.currentTarget.value });
	};
	private readonly _openMarkdownDialog = () => {
		this.props.onOpenDialog(
			<MarkdownDialog
				onClose={this.props.onCloseDialog}
			/>
		);
	};
	private readonly _postAddendum = () => {
		this.setState({ isPosting: true });
		this.props.onPostAddendum({
			commentId: this.props.comment.id,
			text: this.state.text
		});
	};
	private readonly _updateDate: string;
	constructor(props: Props) {
		super(props);
		this._updateDate = DateTime.local().toLocaleString(DateTime.DATE_SHORT);
		this.state = {
			isPosting: false,
			text: ''
		};
	}
	public render() {
		return (
			<div className="comment-addendum-composer_z77dhy">
				<div>Update ({this._updateDate}):</div>
				<textarea
					autoFocus
					onChange={this._changeText}
					value={this.state.text}
				/>
				<div className="controls">
					<ActionLink
						iconLeft="question-circle"
						onClick={this._openMarkdownDialog}
						text="Formatting Guide"
					/>
					<div className="buttons">
						<Button
							text="Cancel"
							state={
								this.state.isPosting ?
									'disabled' :
									'normal'
							}
							onClick={this.props.onClose}
						/>
						<Button
							text="Post Update"
							style="preferred"
							state={
								this.state.isPosting ?
									'busy' :
									this.state.text.trim() ?
										'normal' :
										'disabled'
							}
							onClick={this._postAddendum}
						/>
					</div>
				</div>
			</div>
		);	
	}
}