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
import { NavOptions, NavReference } from '../../Root';
import DownloadButton from '../DownloadButton';

interface Props {
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
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
		<DownloadButton
			analyticsAction='download-section'
			onNavTo={props.onNavTo}
			onCopyAppReferrerTextToClipboard={props.onCopyAppReferrerTextToClipboard}
		/>
	</div>
);

export default DownloadSection;
