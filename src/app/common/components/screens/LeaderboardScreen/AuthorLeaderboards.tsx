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
import Fetchable from '../../../../../common/Fetchable';
import LoadingOverlay from '../../controls/LoadingOverlay';
import AuthorRanking from '../../../../../common/models/AuthorRanking';
import AuthorLeaderboardsTimeWindow from '../../../../../common/models/stats/AuthorLeaderboardsTimeWindow';
import ContentBox from '../../../../../common/components/ContentBox';
import LeaderboardTable from './LeaderboardTable';
import AuthorLink from '../../../../../common/components/AuthorLink';
import SelectList from '../../../../../common/components/SelectList';

interface Props {
	onChangeTimeWindow: (timeWindow: AuthorLeaderboardsTimeWindow) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onViewAuthor: (slug: string, name: string) => void,
	rankings: Fetchable<AuthorRanking[]>,
	timeWindow: AuthorLeaderboardsTimeWindow
}

export default class AuthorLeaderboards extends React.Component<Props> {
	private readonly _changeTimeWindow = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onChangeTimeWindow(
			parseInt(event.target.value, 10) as AuthorLeaderboardsTimeWindow
		);
	};
	private readonly _timeWindowOptions = [
		{
			key: 'All Time',
			value: AuthorLeaderboardsTimeWindow.AllTime
		},
		{
			key: 'Past Week',
			value: AuthorLeaderboardsTimeWindow.PastWeek
		},
		{
			key: 'Past Month',
			value: AuthorLeaderboardsTimeWindow.PastMonth
		},
		{
			key: 'Past Year',
			value: AuthorLeaderboardsTimeWindow.PastYear
		}
	];
	public render() {
		return (
			<div className="author-leaderboards_4rtwc1">
				<ContentBox className="leaderboard">
					<div className="header">
						<span className="title">Top Writers</span>
						<SelectList
							disabled={this.props.rankings.isLoading}
							onChange={this._changeTimeWindow}
							options={this._timeWindowOptions}
							value={this.props.timeWindow}
						/>
					</div>
					<div className="caption">
						Writers are ranked by the amount of time that readers spend reading articles <em>to completion</em>.
					</div>
					{this.props.rankings.isLoading ?
						<LoadingOverlay /> :
						<LeaderboardTable
							rows={
								this.props.rankings.value.map(
									ranking => ({
										key: ranking.slug,
										rank: ranking.rank,
										name: (
											<AuthorLink
												className="link"
												onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
												onViewAuthor={this.props.onViewAuthor}
												name={ranking.name}
												slug={ranking.slug}
											/>
										),
										score: `${ranking.score} min`
									})
								)
							}
						/>}
				</ContentBox>
			</div>
		);
	}
}
