import * as React from 'react';
import LeaderboardBadge from '../models/LeaderboardBadge';
import ShareData from '../sharing/ShareData';
import ShareChannel from '../sharing/ShareChannel';
import LeaderboardBadges from './LeaderboardBadges';
import timeago from 'timeago.js';
import ShareControl, { MenuPosition } from './ShareControl';
import Icon from './Icon';
import ProfileLink from './ProfileLink';

export default (
	props: {
		userName: string,
		leaderboardBadge: LeaderboardBadge,
		date: string
		onCopyTextToClipboard?: (text: string, successMessage: string) => void,
		onGetShareData?: () => ShareData,
		onShare?: (data: ShareData) => ShareChannel[],
		onViewProfile?: (userName: string) => void
	}
) => (
	<div className="post-header_f4a846">
		{props.onViewProfile ?
			<ProfileLink
				className="user-name"
				onViewProfile={props.onViewProfile}
				userName={props.userName}
			/> :
			<span className="user-name">{props.userName}</span>}
		{props.leaderboardBadge !== LeaderboardBadge.None ?
			<LeaderboardBadges badge={props.leaderboardBadge} /> :
			null}
		<span className="age">{timeago().format(props.date.replace(/([^Z])$/, '$1Z'))}</span>
		{(
			props.onCopyTextToClipboard &&
			props.onGetShareData &&
			props.onShare
		) ?
			<ShareControl
				menuPosition={MenuPosition.RightMiddle}
				onCopyTextToClipboard={props.onCopyTextToClipboard}
				onGetData={props.onGetShareData}
				onShare={props.onShare}
			>
				<Icon name="share" />
			</ShareControl> :
			null}
	</div>
);