import * as React from 'react';
import LeaderboardBadge from '../models/LeaderboardBadge';
import ShareData from '../sharing/ShareData';
import ShareResponse from '../sharing/ShareResponse';
import LeaderboardBadges from './LeaderboardBadges';
import { format } from 'timeago.js';
import ShareControl, { MenuPosition } from './ShareControl';
import Icon from './Icon';
import ProfileLink from './ProfileLink';
import UserAccount from '../models/UserAccount';
import { ShareEvent } from '../sharing/ShareEvent';
import * as classNames from 'classnames';

export default (
	props: {
		userName: string,
		leaderboardBadge: LeaderboardBadge,
		isAuthor?: boolean,
		date: string
		onCopyTextToClipboard?: (text: string, successMessage: string) => void,
		onCreateAbsoluteUrl: (path: string) => string,
		onGetShareData?: () => ShareData,
		onShare?: (data: ShareEvent) => ShareResponse,
		onViewProfile: (userName: string) => void,
		user?: UserAccount
	}
) => (
	<div className={classNames('post-header_f4a846', { 'has-flair': props.isAuthor })}>
		{!!props.userName && (!props.user || props.user.name !== props.userName) ?
			<ProfileLink
				className="user-name"
				onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
				onViewProfile={props.onViewProfile}
				userName={props.userName}
			/> :
			<span className="user-name">{props.userName || '[user]'}</span>}
		{props.leaderboardBadge !== LeaderboardBadge.None ?
			<LeaderboardBadges badge={props.leaderboardBadge} /> :
			null}
		<span className="age">{format(props.date.replace(/([^Z])$/, '$1Z'))}</span>
		{(
			props.userName &&
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
				<Icon
					display="block"
					name="share"
				/>
			</ShareControl> :
			null}
		{props.isAuthor ?
			<span className="author">
				<Icon name="verified-user" />
				<span>Writer</span>
			</span> :
			null}
	</div>
);