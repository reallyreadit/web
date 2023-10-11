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
import {
	DeviceType,
	isCompatibleBrowser,
	getExtensionName,
	getStoreUrl,
} from '../../../../common/DeviceType';
import Button from '../../../../common/components/Button';
import * as Cookies from 'js-cookie';
import { extensionInstallationRedirectPathCookieKey } from '../../../../common/cookies';
import Link from '../../../../common/components/Link';

interface Props {
	deviceType: DeviceType;
	onCreateStaticContentUrl: (path: string) => string;
	onSkip: () => void
}
export default class InstallExtensionStep extends React.PureComponent<Props> {
	private readonly _addExtension = (event: React.MouseEvent) => {
		if (window.location.pathname !== '/') {
			Cookies.set(
				extensionInstallationRedirectPathCookieKey,
				window.location.pathname,
				{
					domain: '.' + window.location.hostname,
					expires: new Date(Date.now() + 15 * 60 * 1000),
					path: '/',
					secure: window.location.protocol.startsWith('https'),
					sameSite: 'none',
				}
			);
		}
		window.open((event.currentTarget as HTMLAnchorElement).href);
	};
	public render() {
		return (
			<div className="install-extension-step_gudkmn">
				{isCompatibleBrowser(this.props.deviceType) ? (
					<>
						<h1>
							To read on Readup, add the {this.props.deviceType}{' '}
							{getExtensionName(this.props.deviceType)}.
						</h1>
						{this.props.deviceType === DeviceType.DesktopSafari ? (
							<>
								<h3>
									Step 1: Install the Readup macOS App (includes Safari
									Extension)
								</h3>
								<Button
									href={getStoreUrl(this.props.deviceType)}
									intent="loud"
									onClick={this._addExtension}
									size="large"
									text="View in App Store"
								/>
								<h3>Step 2: Enable the Safari Extension</h3>
								<p>
									In Safari click on the "Safari" menu, select "Preferences...",
									select the "Extensions" tab and then check the box next to
									Readup.
								</p>
								<img
									alt="Enable Readup Extension Screenshot"
									src={this.props.onCreateStaticContentUrl(
										'/app/images/safari-enable-extension-screenshot.png'
									)}
								/>
							</>
						) : (
							<Button
								href={getStoreUrl(this.props.deviceType)}
								intent="loud"
								onClick={this._addExtension}
								size="large"
								text={`Add to ${this.props.deviceType} — It's Free`}
							/>
						)}
					</>
				) : (
					<>
						<h2>Readup isn't available yet for {this.props.deviceType}.</h2>
						<h2>
							Readup is currently available on{' '}
							<a href={getStoreUrl(DeviceType.Ios)} target="_blank">
								iOS
							</a>
							,{' '}
							<a href={getStoreUrl(DeviceType.DesktopChrome)} target="_blank">
								Chrome
							</a>
							,{' '}
							<a href={getStoreUrl(DeviceType.DesktopFirefox)} target="_blank">
								Firefox
							</a>
							,{' '}
							<a href={getStoreUrl(DeviceType.DesktopSafari)} target="_blank">
								Safari
							</a>{' '}
							and{' '}
							<a href={getStoreUrl(DeviceType.DesktopEdge)} target="_blank">
								Edge
							</a>
							.
						</h2>
					</>
				)}
				<Link className="skip" onClick={this.props.onSkip}>Skip</Link>
			</div>
		);
	}
}