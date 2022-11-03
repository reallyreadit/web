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
import FormDialog from '../../../../../common/components/FormDialog';
import ShareControl, { MenuPosition } from '../../../../../common/components/ShareControl';
import Icon from '../../../../../common/components/Icon';
import { ShareEvent } from '../../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../../common/sharing/ShareResponse';
import { findRouteByKey } from '../../../../../common/routing/Route';
import routes from '../../../../../common/routing/routes';
import ScreenKey from '../../../../../common/routing/ScreenKey';
import { ShareChannelData } from '../../../../../common/sharing/ShareData';

export default class GetFollowersDialog extends React.PureComponent<{
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (userName: string) => string,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
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
						onGetData={this._getShareData}
						onShare={this.props.onShare}
						onShareViaChannel={this.props.onShareViaChannel}
					>
						<strong>{`readup.org${this.getProfilePath()}`}</strong> <Icon name="share" />
					</ShareControl>
				</div>
			</FormDialog>
		);
	}
}