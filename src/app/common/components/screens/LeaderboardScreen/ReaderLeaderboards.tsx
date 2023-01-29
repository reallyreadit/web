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
import Leaderboards from '../../../../../common/models/Leaderboards';
import LoadingOverlay from '../../controls/LoadingOverlay';
import ReaderLeaderboard from './ReaderLeaderboard';
import UserAccount from '../../../../../common/models/UserAccount';
import StreakTimer from './StreakTimer';

interface Props {
	leaderboards: Fetchable<Leaderboards>;
	onCreateAbsoluteUrl: (path: string) => string;
	onOpenExplainer: (title: string, content: React.ReactNode) => void;
	onViewProfile: (userName: string) => void;
	user: UserAccount | null;
}
export default class ReaderLeaderboards extends React.Component<Props> {
	private readonly _openScoutExplainer = () => {
		this.props.onOpenExplainer(
			"What's a scout?",
			<p>
				Scouts find the good stuff. They're the first ones to post new articles
				that go on to become Article of the Day (AOTD). The leaderboard shows
				the top Scouts of the last month.
			</p>
		);
	};
	private readonly _openScribeExplainer = () => {
		this.props.onOpenExplainer(
			"What's a scribe?",
			<>
				<p>
					<strong>
						Thoughtful, interesting conversation is the heart and soul of
						Readup. Scribes are the top commenters of the past month.
					</strong>
				</p>
				<p>
					Scribes earn replies in two ways: (1) by replying to others and (2) by
					getting replies on their comments.
				</p>
			</>
		);
	};
	public render() {
		const streak = this.props.leaderboards.value
			? this.props.leaderboards.value.userRankings?.streak
			: null;
		return (
			<div className="reader-leaderboards_8eclav">
				{this.props.leaderboards.isLoading ? (
					<LoadingOverlay />
				) : (
					<div className="leaderboards">
						<ReaderLeaderboard
							title="Top readers this week"
							iconName="power"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="read"
							rankings={this.props.leaderboards.value.weeklyReadCount}
							userRanking={
								this.props.leaderboards.value.userRankings?.weeklyReadCount
							}
							userName={this.props.user?.name}
						/>
						<ReaderLeaderboard
							title="Top readers of all time"
							iconName="medal"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="read"
							rankings={this.props.leaderboards.value.readCount}
							userRanking={
								this.props.leaderboards.value.userRankings?.readCount
							}
							userName={this.props.user?.name}
						/>
						<ReaderLeaderboard
							title="Reading streaks"
							iconName="fire"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="day"
							rankings={this.props.leaderboards.value.streak}
							userRanking={
								streak
									? {
											score: streak.dayCount,
											rank: streak.rank,
									  }
									: null
							}
							userName={this.props.user?.name}
							footer={
								streak?.dayCount ? (
									<div className="streak-status">
										<div className="text">
											{streak.includesToday
												? "You're safe until tomorrow"
												: `Don\'t lose your ${streak.dayCount} day streak!`}
										</div>
										{!streak.includesToday ? (
											<div className="timer">
												<StreakTimer
													timeZoneName={
														this.props.leaderboards.value.timeZoneName
													}
												/>
											</div>
										) : null}
									</div>
								) : null
							}
						/>
						<ReaderLeaderboard
							title="Scouts"
							iconName="binoculars"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="AOTD"
							rankings={this.props.leaderboards.value.scout}
							userRanking={
								this.props.leaderboards.value.userRankings?.scoutCount
							}
							userName={this.props.user?.name}
							onOpenExplainer={this._openScoutExplainer}
						/>
						<ReaderLeaderboard
							title="Scribes"
							iconName="quill"
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewProfile={this.props.onViewProfile}
							scoreUnit="reply"
							scoreUnitPlural="replies"
							rankings={this.props.leaderboards.value.scribe}
							userRanking={
								this.props.leaderboards.value.userRankings?.scribeCount
							}
							userName={this.props.user?.name}
							onOpenExplainer={this._openScribeExplainer}
						/>
						<div className="placeholder"></div>
					</div>
				)}
			</div>
		);
	}
}
