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
import { IconName } from '../../../../../common/components/Icon';
import LeaderboardRanking from '../../../../../common/models/LeaderboardRanking';
import Ranking from '../../../../../common/models/Ranking';
import ProfileLink from '../../../../../common/components/ProfileLink';
import ContentBox from '../../../../../common/components/ContentBox';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardTable from './LeaderboardTable';
import { formatCountable } from '../../../../../common/format';

function formatScore(
	score: number,
	scoreUnit: string,
	scoreUnitPlural?: string
) {
	return `${score} ${formatCountable(score, scoreUnit, scoreUnitPlural)}`;
}
export default (props: {
	footer?: React.ReactNode;
	iconName?: IconName;
	onCreateAbsoluteUrl: (path: string) => string;
	onOpenExplainer?: () => void;
	onViewProfile: (userName: string) => void;
	scoreUnit: string;
	scoreUnitPlural?: string;
	rankings: LeaderboardRanking[];
	title: string;
	userRanking: Ranking | null;
	userName: string | null;
}) => (
	<ContentBox className="reader-leaderboard_ky3yfu">
		<LeaderboardHeader
			iconName={props.iconName}
			onOpenExplainer={props.onOpenExplainer}
			title={props.title}
		/>
		<LeaderboardTable
			overflowLimit={5}
			rows={props.rankings.map((ranking) => ({
				key: ranking.userName,
				rank: ranking.rank,
				name:
					ranking.userName !== props.userName ? (
						<ProfileLink
							className="link"
							onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
							onViewProfile={props.onViewProfile}
							userName={ranking.userName}
						/>
					) : (
						ranking.userName
					),
				score: formatScore(
					ranking.score,
					props.scoreUnit,
					props.scoreUnitPlural
				),
			}))}
		/>
		{props.userRanking && props.userName ? (
			<>
				<hr className="break" />
				<LeaderboardTable
					rows={[
						{
							key: props.userName,
							rank: props.userRanking.rank,
							name: props.userName,
							score: formatScore(
								props.userRanking.score,
								props.scoreUnit,
								props.scoreUnitPlural
							),
						},
					]}
				/>
			</>
		) : null}
		<div className="footer">{props.footer}</div>
	</ContentBox>
);
