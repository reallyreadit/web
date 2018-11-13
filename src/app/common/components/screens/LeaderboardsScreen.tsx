import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserReadStats from '../../../../common/models/UserReadStats';
import ReadingLeaderboardRow from '../../../../common/models/ReadingLeaderboardRow';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';

export default (props: {
	leaderboard: Fetchable<ReadingLeaderboardRow[]>,
	stats: Fetchable<UserReadStats | null>,
	user: UserAccount | null
}) => (
	<div className="leaderboards-screen_wuzsob">
		{props.stats.isLoading || props.leaderboard.isLoading ?
			<LoadingOverlay /> :
			<>
				<div className="panel stats">
					{props.stats.value ?
						<ol>
							<li>
								You've read <strong>{props.stats.value.readCount} {props.stats.value.readCount > 1 ? 'articles' : 'article'}</strong>
							</li>
							<li>
								Overall rank: <strong>{props.stats.value.readCountRank} out of {props.stats.value.userCount}</strong>
							</li>
						</ol> :
						props.user ?
							<span>Start reading to see your stats</span> :
							<span>Sign up to see your personal reading stats</span>}
				</div>
				<div className="panel leaderboard">
					<table>
						<caption>Top Readers</caption>
						<tbody>
							{props.leaderboard.value.map(row => (
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