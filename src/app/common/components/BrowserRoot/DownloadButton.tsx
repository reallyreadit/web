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
import { DeviceType } from '../../../../common/DeviceType';
import Button from '../../../../common/components/Button';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { createUrl } from '../../../../common/HttpEndpoint';
import { deviceTypeQueryStringKey } from '../../../../common/routing/queryString';
import { Intent } from '../../../../common/components/Toaster';
import { getStoreUrl, isIosDevice, isAndroidDevice } from '../../../../common/stores';

type Props = {
	analyticsAction: string;
	location: RouteLocation;
	onCopyAppReferrerTextToClipboard?: (analyticsAction: string) => void;
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onShowToast: (text: string, intent: Intent) => void;
};

type State = {
	isSupported: 'unknown'
} | {
	isSupported: 'false'
} | {
	isSupported: 'true',
	storeUrl: string | null,
	isApp: boolean
};

export default class DownloadButton extends React.Component<Props, State> {
	private readonly _openExtensionStore = () => {
		if (this.state.isSupported !== 'true' || !this.state.storeUrl) {
			this.props.onShowToast('Sorry, this browser is not supported.', Intent.Neutral);
			return;
		}
		window.open(this.state.storeUrl);
	};

	private _openInApp = () => {
		this.props.onCopyAppReferrerTextToClipboard(this.props.analyticsAction);
		window.location.href = createUrl(
			{
				host: 'reallyread.it',
				protocol: 'https',
			},
			this.props.location.path,
			{
				[deviceTypeQueryStringKey]: DeviceType.Ios,
			}
		);
	};

	public componentDidMount = () => {
		let state: State;
		if (isAndroidDevice()) {
			state = {
				isSupported: 'false'
			};
		} else {
			state = {
				isSupported: 'true',
				storeUrl: getStoreUrl(),
				isApp: isIosDevice()
			};
		}
		this.setState(state);
	};

	constructor(props: Props) {
		super(props);
		this.state = {
			isSupported: null
		};
	}

	public render() {
		let content: React.ReactNode;
		if (this.state.isSupported === 'true') {
			if (this.state.isApp) {
				content = (
					<Button
						text="Open in App"
						size="large"
						intent="loud"
						onClick={this._openInApp}
					/>
				);
			} else {
				content = (
					<Button
						text="Install Extension"
						size="large"
						intent="loud"
						onClick={this._openExtensionStore}
					/>
				);
			}
		} else if (this.state.isSupported === 'false') {
			content = (
				<>
					<p>Get notified when the app is out on Android</p>
					<Button
						text="Get Notified"
						size="large"
						intent="loud"
						onClick={this.props.onOpenNewPlatformNotificationRequestDialog}
					/>
				</>
			);
		}
		return (
			<div className="download-button_twjkoi">
				{content}
			</div>
		);
	}
}
