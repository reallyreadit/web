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
import {DeviceType} from '../../../../common/DeviceType';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { MarketingVariant } from '../../marketingTesting';
import {NavOptions, NavReference} from '../Root';
import DownloadButton from './DownloadButton';

export default (
	props: {
		analyticsAction: string,
		marketingVariant: MarketingVariant,
		deviceType: DeviceType,
		location: RouteLocation,
		onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
		onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
		onCreateStaticContentUrl: (path: string) => string,
	}
) => {
	return (
	<div className="marketing-banner_y7i2hw">
		<div className="content">
			{/* <h1>{props.marketingVariant.headline}</h1> */}
			<div className="text">
				<h1>The world's best reading app</h1>
				<h3>{props.marketingVariant.subtext}</h3>
			</div>
			<div className="buttons">
				<DownloadButton
					analyticsAction="LeaderboardsScreen"
					deviceType={props.deviceType}
					location={props.location}
					onNavTo={props.onNavTo}
					onCopyAppReferrerTextToClipboard={props.onCopyAppReferrerTextToClipboard}
					onCreateStaticContentUrl={props.onCreateStaticContentUrl}
					showOpenInApp={true}
				/>
				{/* TODO: might look nicer if a secondary <Button> were used */}
				{/* <Link screen={ScreenKey.Home} className="learn-more-button" onClick={this.props.onNavTo}>Learn More</Link> */}
			</div>
		</div>
	</div>
) };