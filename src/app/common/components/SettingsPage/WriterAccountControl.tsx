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
import Button from '../../../../common/components/Button';
import { Intent } from '../../../../common/components/Toaster';
import { SharedState } from '../Root';
import { TwitterVerificationDialog } from './WriterAccountControl/TwitterVerificationDialog';
import AuthorProfile from '../../../../common/models/authors/AuthorProfile';
import { EmailVerificationDialog } from './WriterAccountControl/EmailVerificationDialog';
import { AuthorEmailVerificationRequest } from '../../../../common/models/userAccounts/AuthorEmailVerificationRequest';
import { TweetWebIntentParams } from '../../../../common/sharing/twitter';
import ContentBox from '../../../../common/components/ContentBox';

interface Props {
	authorProfile: AuthorProfile | null,
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onOpenDialog: (renderer: (sharedState: SharedState) => React.ReactNode) => void,
	onOpenTweetComposer: (params: TweetWebIntentParams) => void,
	onShowToast: (content: React.ReactNode, intent: Intent) => void,
	onSubmitAuthorEmailVerificationRequest: (request: AuthorEmailVerificationRequest) => Promise<void>
}

export class WriterAccountControl extends React.Component<Props> {
	private readonly _openEmailVerificationDialog = () => {
		this.props.onOpenDialog(
			() => (
				<EmailVerificationDialog
					onCloseDialog={this.props.onCloseDialog}
					onShowToast={this.props.onShowToast}
					onSubmitRequest={this.props.onSubmitAuthorEmailVerificationRequest}
				/>
			)
		);
	};
	private readonly _openTwitterVerificationDialog = () => {
		this.props.onOpenDialog(
			sharedState => (
				<TwitterVerificationDialog
					onClose={this.props.onCloseDialog}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onOpenTweetComposer={this.props.onOpenTweetComposer}
					onUseEmailVerification={this._openEmailVerificationDialog}
					user={sharedState.user}
				/>
			)
		);
	};
	public render() {
		return (
			<div className="writer-account-control_yerlvh">
				{this.props.authorProfile ?
					<ContentBox>
						<p><strong>{this.props.authorProfile.name}</strong></p>
						<p>Verification complete.</p>
					</ContentBox> :
					<>
						<p>Are you a writer? Get verified so that you can comment on your own articles without having to read them.</p>
						<Button
							intent="loud"
							onClick={this._openTwitterVerificationDialog}
							style="preferred"
							text="Get Verified"
						/>
					</>}
			</div>
		);
	}
}