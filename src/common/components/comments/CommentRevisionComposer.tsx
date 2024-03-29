// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import CommentThread from '../../models/CommentThread';
import CommentRevisionForm from '../../models/social/CommentRevisionForm';
import Button from '../Button';
import { formatIsoDateAsUtc } from '../../format';
import { DateTime, Duration } from 'luxon';
import AsyncTracker from '../../AsyncTracker';
import Link from '../Link';
import MarkdownDialog from '../MarkdownDialog';

interface Props {
	comment: CommentThread;
	initialHeight: number;
	onClose: () => void;
	onCloseDialog: () => void;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onCreateAddendum: () => void;
	onPostRevision: (form: CommentRevisionForm) => Promise<CommentThread>;
}
export default class CommentRevisionComposer extends React.PureComponent<
	Props,
	{
		isPosting: boolean;
		text: string;
		timeRemaining: Duration;
	}
> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _timerInterval: number;
	private readonly _timeoutDate: DateTime;
	private readonly _changeText = (
		event: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		this.setState({ text: event.currentTarget.value });
	};
	private readonly _openMarkdownDialog = () => {
		this.props.onOpenDialog(
			<MarkdownDialog onClose={this.props.onCloseDialog} />
		);
	};
	private readonly _postRevision = () => {
		this.setState({ isPosting: true });
		this.props.onPostRevision({
			commentId: this.props.comment.id,
			text: this.state.text,
		});
	};
	constructor(props: Props) {
		super(props);
		this._timeoutDate = DateTime.fromISO(
			formatIsoDateAsUtc(props.comment.dateCreated)
		).plus({ minutes: 3 });
		this.state = {
			isPosting: false,
			text: props.comment.text,
			timeRemaining: this.getTimeRemaining(),
		};
		this._timerInterval = this._asyncTracker.addInterval(
			window.setInterval(() => {
				const timeRemaining = this.getTimeRemaining();
				this.setState({ timeRemaining });
				if (timeRemaining.seconds <= 0) {
					window.clearInterval(this._timerInterval);
				}
			}, 1000)
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
					<div className="left-group">
						<Link
							iconLeft="question-circle"
							onClick={this._openMarkdownDialog}
							text="Formatting Guide"
						/>
						<div className="timer">
							{!this.state.isPosting ? (
								this.state.timeRemaining.seconds > 0 ? (
									<>
										<div>
											You have{' '}
											{this.state.timeRemaining.minutes > 0 ? (
												<span>{this.state.timeRemaining.minutes}m </span>
											) : null}
											{Math.floor(this.state.timeRemaining.seconds)}s remaining
											to fix typos. After that you can add updates.
										</div>
									</>
								) : (
									<>
										<div>
											The typo timer ran out. Copy your work and{' '}
											<Link
												text="add an update"
												onClick={this.props.onCreateAddendum}
											/>{' '}
											instead.
										</div>
									</>
								)
							) : null}
						</div>
					</div>
					<div className="buttons">
						<Button
							text="Cancel"
							state={this.state.isPosting ? 'disabled' : 'normal'}
							onClick={this.props.onClose}
						/>
						<Button
							text="Save Changes"
							style="preferred"
							state={
								this.state.isPosting
									? 'busy'
									: this.state.timeRemaining.seconds > 0 &&
									  trimmedText &&
									  trimmedText !== this.props.comment.text
									? 'normal'
									: 'disabled'
							}
							onClick={this._postRevision}
						/>
					</div>
				</div>
			</div>
		);
	}
}
