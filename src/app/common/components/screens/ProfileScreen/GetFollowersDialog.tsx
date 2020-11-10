import * as React from 'react';
import FormDialog from '../../../../../common/components/FormDialog';
import ShareControl, { MenuPosition } from '../../../../../common/components/ShareControl';
import Icon from '../../../../../common/components/Icon';
import ShareData from '../../../../../common/sharing/ShareData';
import ShareResponse from '../../../../../common/sharing/ShareResponse';
import { findRouteByKey } from '../../../../../common/routing/Route';
import routes from '../../../../../common/routing/routes';
import ScreenKey from '../../../../../common/routing/ScreenKey';

export default class GetFollowersDialog extends React.PureComponent<{
	onCloseDialog: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (userName: string) => string,
	onShare: (data: ShareData) => ShareResponse,
	userName: string
}> {
	private readonly _getShareData = () => {
		const url = this.props.onCreateAbsoluteUrl(this.getProfilePath());
		return {
			action: 'GetFollowersDialog',
			email: {
				body: url,
				subject: 'Follow me on Readup'
			},
			text: 'Follow me on Readup',
			url
		};
	};
	private readonly _profileRoute = findRouteByKey(routes, ScreenKey.Profile);
	private getProfilePath() {
		return this._profileRoute.createUrl({ userName: this.props.userName });
	}
	public render() {
		return (
			<FormDialog
				className="get-followers-dialog_woa1zs"
				closeButtonText="Ok"
				onClose={this.props.onCloseDialog}
				size="small"
				title="Get Followers"
			>
				<p>Share this link with the most thoughtful, readerly people you know.</p>
				<div className="url">
					<ShareControl
						menuPosition={MenuPosition.TopCenter}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onGetData={this._getShareData}
						onShare={this.props.onShare}
					>
						<strong>{`readup.com${this.getProfilePath()}`}</strong> <Icon name="share" />
					</ShareControl>
				</div>
			</FormDialog>
		);
	}
}