import * as React from 'react';
import LeaderboardBadge from '../models/LeaderboardBadge';
import ShareData, { ShareChannelData } from '../sharing/ShareData';
import ShareResponse from '../sharing/ShareResponse';
import LeaderboardBadges from './LeaderboardBadges';
import { format } from 'timeago.js';
import ShareControl, { MenuPosition } from './ShareControl';
import Icon from './Icon';
import ProfileLink from './ProfileLink';
import UserAccount from '../models/UserAccount';
import { ShareEvent } from '../sharing/ShareEvent';
import * as classNames from 'classnames';
import UserArticle from '../models/UserArticle';

interface BaseProps {
	userName: string,
	leaderboardBadge: LeaderboardBadge,
	isAuthor?: boolean,
	date: string
	onCreateAbsoluteUrl: (path: string) => string,
	onGetShareData?: () => ShareData,
	onShare?: (data: ShareEvent) => ShareResponse,
	onShareViaChannel?: (data: ShareChannelData) => void,
	onViewProfile: (userName: string) => void,
	/** adds the copy "posted" to make explicitly denote the action done
	 * NOTE: unused for now, part of an update that we may include soon
	*/
	user?: UserAccount
};

type VerboseProps = BaseProps & {
	verbose: boolean,
	// needed to infer scout status
	article: UserArticle,
	// note: this is technically redundant, we could currently check for
	// it being a silent post or not by looking at the presence of sharing props
	// however, in case we ever allow for sharing silent posts, this is a semantic way
	// of keeping behavior modular.
	isComment: boolean,
	isReply: boolean
}

type Props = BaseProps | VerboseProps;

function isVerboseProps(props: BaseProps | VerboseProps): props is VerboseProps {
	return typeof (props as VerboseProps).verbose === 'boolean';
}

// what did the user do in this post?
function getVerboseCopy(props: VerboseProps) {
	// this is reply to one of the user's posts
	if (props.isReply) {
		return "replied";
	}
	// scouting status trumps all
	if (props.userName === props.article.firstPoster) {
		return "scouted";
	}
	if (props.isComment) {
		return "commented";
	}
	// silent post
	return "read";
}

const PostHeader = (
	props: Props
) => (
	<div className={classNames('post-header_f4a846', { 'has-flair': props.isAuthor, 'is-verbose': isVerboseProps(props) && props.verbose })}>
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
		{
			isVerboseProps(props) && props.verbose ?
				<span className="posted-copy">{getVerboseCopy(props)}</span> : null
		}
		<span className="age">{format(props.date.replace(/([^Z])$/, '$1Z'))}</span>
		{(
			props.userName &&
			props.onGetShareData &&
			props.onShare &&
			props.onShareViaChannel
		) ?
			<ShareControl
				menuPosition={MenuPosition.RightMiddle}
				onGetData={props.onGetShareData}
				onShare={props.onShare}
				onShareViaChannel={props.onShareViaChannel}
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

PostHeader.defaultProps = {
	verbose: false
};

export default PostHeader;