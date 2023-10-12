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
import ExtensionButtonImage from '../../BrowserRoot/ExtensionButtonImage';
import { DeviceType } from '../../../../../common/DeviceType';
import Button from '../../../../../common/components/Button';

export default (props: {
	deviceType: DeviceType;
	onContinue: () => void;
	onCreateStaticContentUrl: (path: string) => string;
}) => (
	<div className="extension-installed-step_k3sj2r">
		<h1>Great! You now have the Readup button!</h1>
		{props.deviceType === DeviceType.DesktopSafari ? (
			<>
				<h3>Grant Permission to the Extension to Get Started</h3>
				<p>
					Click the Readup button and then select "Always Allow on This Website"
					to allow the extension to talk to the Readup website. You only have to
					do this once.
				</p>
				<img
					alt="Grant Extension Access Screenshot"
					src={props.onCreateStaticContentUrl(
						'/app/images/bai-screenshot-safari-warning.png'
					)}
				/>
				<img
					alt="Extension Access Granted Screenshot"
					src={props.onCreateStaticContentUrl(
						'/app/images/bai-screenshot-safari.png'
					)}
				/>
				<h3>
					Now, whenever you see something you want to read, just hit that
					button.
				</h3>
			</>
		) : (
			<>
				<h2>Whenever you see something you want to read, hit that button.</h2>
				<ExtensionButtonImage
					deviceType={props.deviceType}
					onCreateStaticContentUrl={props.onCreateStaticContentUrl}
				/>
			</>
		)}
		<Button
			intent="loud"
			onClick={props.onContinue}
			size="large"
			text="Got It"
		/>
	</div>
);
