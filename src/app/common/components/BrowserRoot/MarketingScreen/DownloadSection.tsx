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
import { DeviceType } from '../../../../../common/DeviceType';
import RouteLocation from '../../../../../common/routing/RouteLocation';
import { NavOptions, NavReference } from '../../Root';
import GetStartedButton from '../GetStartedButton';

interface Props {
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void;
	deviceType: DeviceType;
	location: RouteLocation;
	onBeginOnboarding: (analyticsAction: string) => void;
	onCreateStaticContentUrl: (path: string) => string;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
	onOpenNewPlatformNotificationRequestDialog: () => void;
}

export const DownloadSection: React.FunctionComponent<Props> = (
	props: Props
) => (
	<div className="download-section_45nqkz">
		<div className="download-section_45nqkz__details">
			<div className="download-section_45nqkz__details__heading">
				Read on all your devices
			</div>
			<p>
				Read with desktop browsers, or on the go with your iPhone & iPad.
				Android coming soon.
			</p>
		</div>
		<GetStartedButton
			iosPromptType='download'
			deviceType={props.deviceType}
			location={props.location}
			onBeginOnboarding={props.onBeginOnboarding}
			onCopyAppReferrerTextToClipboard={props.onCopyAppReferrerTextToClipboard}
			onCreateStaticContentUrl={props.onCreateStaticContentUrl}
			onOpenNewPlatformNotificationRequestDialog={
				props.onOpenNewPlatformNotificationRequestDialog
			}
		/>
	</div>
);

export default DownloadSection;
