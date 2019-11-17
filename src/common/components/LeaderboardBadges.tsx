import * as React from 'react';
import LeaderboardBadge from '../models/LeaderboardBadge';
import Icon, { IconName } from './Icon';

export default (
	props: {
		badge: LeaderboardBadge
	}
) => {
	let badges: {
		iconName: IconName,
		title: string
	}[] = [];
	if (props.badge & LeaderboardBadge.WeeklyReadCount) {
		badges.push({
			iconName: 'power',
			title: 'Top reader this week'
		});
	}
	if (props.badge & LeaderboardBadge.ReadCount) {
		badges.push({
			iconName: 'medal',
			title: 'Top reader of all time'
		});
	}
	if (props.badge & LeaderboardBadge.Streak) {
		badges.push({
			iconName: 'fire',
			title: 'Reading streak'
		});
	}
	if (props.badge & LeaderboardBadge.LongestRead) {
		badges.push({
			iconName: 'graduation',
			title: 'Longest recent read'
		});
	}
	if (props.badge & LeaderboardBadge.Scout) {
		badges.push({
			iconName: 'binoculars',
			title: 'Scout'
		});
	}
	if (props.badge & LeaderboardBadge.Scribe) {
		badges.push({
			iconName: 'quill',
			title: 'Scribe'
		});
	}
	return (
		<div className="leaderboard-badges_s4o6nj">
			{badges.map(
				badge => (
					<Icon
						className="badge"
						key={badge.iconName}
						name={badge.iconName}
						title={badge.title}
					/>
				)
			)}
		</div>
	);
}