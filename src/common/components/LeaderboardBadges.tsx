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