import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import UserStats from '../../../../common/models/UserStats';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';
import Leaderboards from '../../../../common/models/Leaderboards';

export default (props: {
	leaderboards: Fetchable<Leaderboards>,
	stats: Fetchable<UserStats | null>,
	user: UserAccount | null
}) => (
	<div className="leaderboards-screen_wuzsob">
		{props.stats.isLoading || props.leaderboards.isLoading ?
			<LoadingOverlay /> :
			<>
				<div className="panel stats">
					{props.stats.value ?
						<>
							<ol>
								<li>
									You've read <strong>{props.stats.value.readCount} {props.stats.value.readCount > 1 ? 'articles' : 'article'}.</strong>
								</li>
								<li>
									Rank: {props.stats.value.readCountRank} out of {props.stats.value.userCount}
								</li>
							</ol>
							<ol>
								<li>
									Current streak: <strong>{props.stats.value.streak || 0} {props.stats.value.streak === 1 ? 'day' : 'days'}.</strong>
								</li>
								<li>
									Rank: {props.stats.value.streakRank || 0} out of {props.stats.value.userCount}
								</li>
							</ol>
						</> :
						props.user ?
							<span>Start reading to see your stats.</span> :
							<span>Sign up to see your personal reading stats.</span>}
				</div>
				<div className="panel leaderboard">
					<table>
						<caption>Top Streaks</caption>
						<tbody>
							{props.leaderboards.value.currentStreak.map(row => (
								<tr key={row.name}>
									<td>{row.name}</td>
									<td>{row.streak.toLocaleString()} {row.streak > 1 ? 'days' : 'day'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="panel leaderboard">
					<table>
						<caption>Top Readers</caption>
						<tbody>
							{props.leaderboards.value.readCount.map(row => (
								<tr key={row.name}>
									<td>{row.name}</td>
									<td>{row.readCount.toLocaleString()} {row.readCount > 1 ? 'reads' : 'read'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</>}
	</div>
);