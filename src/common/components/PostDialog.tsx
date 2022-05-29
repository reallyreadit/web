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
import FormDialog from './FormDialog';
import RatingSelector from './RatingSelector';
import PostForm from '../models/social/PostForm';
import Post from '../models/social/Post';
import { Intent } from './Toaster';
import UserArticle from '../models/UserArticle';
import Link from './Link';
import MarkdownDialog from './MarkdownDialog';
import ToggleSwitchInput from './ToggleSwitchInput';
import UserAccount from '../models/UserAccount';
import AuthServiceProvider from '../models/auth/AuthServiceProvider';
import AuthServiceAccountAssociation from '../models/auth/AuthServiceAccountAssociation';

interface Props {
	article: UserArticle,
	onCloseDialog?: () => void,
	onLinkAuthServiceAccount: (provider: AuthServiceProvider) => Promise<AuthServiceAccountAssociation>,
	onOpenDialog: (dialog: React.ReactNode, method: 'push' | 'replace') => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSubmit: (form: PostForm) => Promise<Post>,
	user: UserAccount
}
interface State {
	commentText: string,
	isLinkingTwitterAccount: boolean,
	ratingScore?: number,
	tweet: boolean
}
export default class PostDialog extends React.PureComponent<Props, State> {
	private readonly _changeCommentText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (this._isLinkingTwitterAccount) {
			return;
		}
		this.setState({
			commentText: event.currentTarget.value
		});
	};
	private readonly _changeRatingScore = (ratingScore?: number) => {
		if (this._isLinkingTwitterAccount) {
			return;
		}
		this.setState({
			ratingScore
		});
	};
	private readonly _changeTweet = (value: string, isEnabled: boolean) => {
		this.setState({
			tweet: isEnabled
		});
		if (
			isEnabled &&
			!this.props.user.hasLinkedTwitterAccount &&
			!this._hasLinkedTwitterAccount
		) {
			this._isLinkingTwitterAccount = true;
			this.setState({
				isLinkingTwitterAccount: true
			});
			return this.props
				.onLinkAuthServiceAccount(AuthServiceProvider.Twitter)
				.then(
					() => {
						this._isLinkingTwitterAccount = false;
						this._hasLinkedTwitterAccount = true;
						this.setState({
							isLinkingTwitterAccount: false
						});
						this.props.onShowToast('Account Linked', Intent.Success);
					}
				)
				.catch(
					error => {
						this._isLinkingTwitterAccount = false;
						this.setState({
							isLinkingTwitterAccount: false,
							tweet: false
						});
						const errorMessage = (error as Error)?.message;
						if (errorMessage !== 'Unsupported') {
							let
								toastText: string,
								toastIntent: Intent;
							if (errorMessage === 'Cancelled') {
								toastText = 'Authentication Cancelled';
								toastIntent = Intent.Neutral;
							} else {
								toastText = 'Error: ' + (errorMessage ?? 'Unknown error') + '.';
								toastIntent = Intent.Danger;
							}
							this.props.onShowToast(toastText, toastIntent);
						}
						throw error;
					}
				);
		}
		return undefined;
	};
	// ugly hack required because the user prop doesn't update
	// from the global context set state due to the messy dialog system
	private _hasLinkedTwitterAccount = false;
	private _isLinkingTwitterAccount = false;
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
			isLinkingTwitterAccount: false,
			ratingScore: props.article.ratingScore,
			tweet: props.user.hasLinkedTwitterAccount
		};
	}
	public render() {
		return (
			<FormDialog
				buttonsDisabled={this.state.isLinkingTwitterAccount}
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
				<Link
					iconLeft="question-circle"
					onClick={this._openMarkdownDialog}
					state={
						this.state.isLinkingTwitterAccount ?
							'disabled' :
							'normal'
					}
					text="Formatting Guide"
				/>
				<ToggleSwitchInput
					isEnabled={this.state.tweet}
					onChange={this._changeTweet}
					title="Tweet this post"
				/>
			</FormDialog>
		);
	}
}