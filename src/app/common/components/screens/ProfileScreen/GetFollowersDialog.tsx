import * as React from 'react';
import Dialog from '../../controls/Dialog';
import ShareControl, { MenuPosition } from '../../../../../common/components/ShareControl';
import Icon from '../../../../../common/components/Icon';
import ShareData from '../../../../../common/sharing/ShareData';
import ShareChannel from '../../../../../common/sharing/ShareChannel';

export default class GetFollowersDialog extends React.PureComponent<{
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onShare: (data: ShareData) => ShareChannel[],
	userName: string
}> {
	private readonly _getShareData = () => {
		const url = this.getProfileUrl();
		return {
			email: {
				body: url,
				subject: 'Follow me on Readup'
			},
			text: 'Follow me on Readup',
			url
		};
	};
	private getProfileUrl() {
		return `readup.com/@${this.props.userName}`;
	}
	public render() {
		return (
			<Dialog
				className="get-followers-dialog_woa1zs"
				onClose={this.props.onCloseDialog}
				title="Get Followers"
			>
				<p><strong>Reading with friends is more fun than reading alone.</strong></p>
				<p>Share this link with the most thoughtful, readerly people you know.</p>
				<div className="url">
					<ShareControl
						menuPosition={MenuPosition.TopCenter}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onGetData={this._getShareData}
						onShare={this.props.onShare}
					>
						<strong>{this.getProfileUrl()}</strong> <Icon name="share" />
					</ShareControl>
				</div>
			</Dialog>
		);
	}
}