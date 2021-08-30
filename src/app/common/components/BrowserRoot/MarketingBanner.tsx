
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
				/>
				{/* TODO: might look nicer if a secondary <Button> were used */}
				{/* <Link screen={ScreenKey.Home} className="learn-more-button" onClick={this.props.onNavTo}>Learn More</Link> */}
			</div>
		</div>
	</div>
) };