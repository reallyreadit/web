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
import { DeviceType, getStoreUrl } from '../../../../common/DeviceType';
import Button, { ButtonSize } from '../../../../common/components/Button';
import RouteLocation from '../../../../common/routing/RouteLocation';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { createUrl } from '../../../../common/HttpEndpoint';
import { deviceTypeQueryStringKey } from '../../../../common/routing/queryString';
import { NavMethod, NavOptions, NavReference } from '../Root';
import Link from '../../../../common/components/Link';

type BaseProps = {
	analyticsAction: string;
	showOtherPlatforms?: boolean;
	size?: ButtonSize;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
	onCopyAppReferrerTextToClipboard?: (analyticsAction: string) => void;
	onOpenNewPlatformNotificationRequestDialog: () => void;
	deviceType: DeviceType;
	onCreateStaticContentUrl: (path: string) => string;
};

// it should be possible to use the DownloadButton without informing it of our current location
// (this is only required when it is desired to open the current page in the app)
type ShowInAppProps = BaseProps & {
	showOpenInApp: true;
	location: RouteLocation;
};

export type Props = BaseProps | ShowInAppProps;

function isShowInAppProps(props: Props): props is ShowInAppProps {
	return typeof (props as ShowInAppProps).showOpenInApp === 'boolean';
}

export default class DownloadButton extends React.Component<Props> {
	public static defaultProps: Pick<Props, 'showOtherPlatforms' | 'size'> = {
		size: 'x-large',
		showOtherPlatforms: false,
	};

	private readonly _copyAppReferrerTextToClipboard = () => {
		this.props.onCopyAppReferrerTextToClipboard(this.props.analyticsAction);
	};

	private _openInApp = () => {
		if (isShowInAppProps(this.props) && this.props.showOpenInApp) {
			if (this.props.deviceType === DeviceType.Ios) {
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
			}
		}
	};

	public componentDidMount = () => {
		// Try an automatic redirect to the app, if:
		// - On desktop? Only if not on Safari Desktop.
		// - Not on iOS. Applinks association only works after a click action & causes an error otherwise (invalid address)
		// - Not on Android. There's no Android app so far.
		if (
			isShowInAppProps(this.props) &&
			this.props.showOpenInApp &&
			this.props.deviceType &&
			this.props.deviceType !== DeviceType.DesktopSafari &&
			this.props.deviceType !== DeviceType.Ios &&
			this.props.deviceType !== DeviceType.Android
		) {
			this._openInApp();
		}
	};

	private _renderGenericButton = () => {
		return (
			<Button
				text="Install Extension"
				size="large"
				intent="loud"
				onClick={() =>
					this.props.onNavTo(
						{ key: ScreenKey.Download },
						{ method: NavMethod.ReplaceAll }
					)
				}
			/>
		);
	};
	public render() {
		return (
			<div className="download-button_twjkoi">
				{this.props.deviceType === DeviceType.Ios ? (
					<a
						className="ios"
						href={getStoreUrl(DeviceType.Ios)}
						onClick={
							this.props.onCopyAppReferrerTextToClipboard
								? this._copyAppReferrerTextToClipboard
								: null
						}
					>
						<img
							src={this.props.onCreateStaticContentUrl(
								'/app/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg'
							)}
							alt="App Store Badge"
						/>
					</a>
				) : this.props.deviceType === DeviceType.Android ? (
					<>
						<p>Get notified when the app is out on Android</p>
						<Button
							text="Get Notified"
							size="normal"
							onClick={this.props.onOpenNewPlatformNotificationRequestDialog}
						/>
					</>
				) : (
					this._renderGenericButton()
				)}
				{isShowInAppProps(this.props) &&
				this.props.showOpenInApp &&
				(this.props.deviceType === DeviceType.Ios ||
					this.props.deviceType === DeviceType.DesktopSafari) ? (
					<Button
						text="Open in App"
						size='normal'
						intent="normal"
						className="open-in-app"
						onClick={this._openInApp}
					/>
				) : null}
				{/* only show the link for other platforms if the download button isn't already generic */}
				{this.props.showOtherPlatforms ? (
					<div className="platforms">
						<Link screen={ScreenKey.Download} onClick={this.props.onNavTo}>
							Other platforms
						</Link>
					</div>
				) : null}
			</div>
		);
	}
}
