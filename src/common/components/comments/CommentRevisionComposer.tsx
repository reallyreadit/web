import * as React from 'react';
import CommentThread from '../../models/CommentThread';
import CommentRevisionForm from '../../models/social/CommentRevisionForm';
import Button from '../Button';
import { htmlDecode, formatIsoDateAsUtc } from '../../format';
import { DateTime, Duration } from 'luxon';
import AsyncTracker from '../../AsyncTracker';
import ActionLink from '../ActionLink';

interface Props {
	comment: CommentThread,
	initialHeight: number,
	onClose: () => void,
	onCreateAddendum: () => void,
	onPostRevision: (form: CommentRevisionForm) => Promise<CommentThread>
}
export default class CommentRevisionComposer extends React.PureComponent<
	Props,
	{
		isPosting: boolean,
		text: string,
		timeRemaining: Duration
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _timerInterval: number;
	private readonly _timeoutDate: DateTime;
	private readonly _originalText: string;
	private readonly _changeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.setState({ text: event.currentTarget.value });
	};
	private readonly _postRevision = () => {
		this.setState({ isPosting: true });
		this.props.onPostRevision({
			commentId: this.props.comment.id,
			text: this.state.text
		});
	};
	constructor(props: Props) {
		super(props);
		this._timeoutDate = DateTime
			.fromISO(formatIsoDateAsUtc(props.comment.dateCreated))
			.plus({ minutes: 3 });
		this._originalText = htmlDecode(props.comment.text);
		this.state = {
			isPosting: false,
			text: this._originalText,
			timeRemaining: this.getTimeRemaining()
		};
		this._timerInterval = this._asyncTracker.addInterval(
			window.setInterval(
				() => {
					const timeRemaining = this.getTimeRemaining();
					this.setState({ timeRemaining });
					if (timeRemaining.seconds <= 0) {
						window.clearInterval(this._timerInterval);
					}
				},
				1000
			)
		);
	}
	private getTimeRemaining() {
		return this._timeoutDate.diffNow(['minutes', 'seconds']);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		const trimmedText = this.state.text.trim();
		return (
			<div className="comment-revision-composer_dnzrxr">
				<textarea
					autoFocus
					onChange={this._changeText}
					value={this.state.text}
					style={{ minHeight: this.props.initialHeight }}
				/>
				<div className="controls">
					<div className="timer">
						{!this.state.isPosting ?
							this.state.timeRemaining.seconds > 0 ?
								<>
									<div>You have {this.state.timeRemaining.minutes > 0 ? <span>{this.state.timeRemaining.minutes}m </span> : null}{Math.floor(this.state.timeRemaining.seconds)}s remaining to fix typos. After that you can add updates.</div>
								</> :
								<>
									<div>The typo timer ran out. Copy your work and <ActionLink text="add an update" onClick={this.props.onCreateAddendum} /> instead.</div>
								</> :
								null}
					</div>
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
							text="Save Changes"
							style="preferred"
							state={
								this.state.isPosting ?
									'busy' :
									this.state.timeRemaining.seconds > 0 && trimmedText && trimmedText !== this._originalText ?
										'normal' :
										'disabled'
							}
							onClick={this._postRevision}
						/>
					</div>
				</div>
			</div>
		);
	}
}