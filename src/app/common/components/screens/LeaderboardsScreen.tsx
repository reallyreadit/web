import * as React from 'react';
import Fetchable from '../../serverApi/Fetchable';
import UserWeeklyReadingStats from '../../../../common/models/UserWeeklyReadingStats';
import WeeklyReadingLeaderboards from '../../../../common/models/WeeklyReadingLeaderboards';
import LoadingOverlay from '../controls/LoadingOverlay';
import readingParameters from '../../../../common/readingParameters';
import UserAccount from '../../../../common/models/UserAccount';

export default (props: {
	leaderboards: Fetchable<WeeklyReadingLeaderboards>,
	onGetUser: () => UserAccount | null,
	stats: Fetchable<UserWeeklyReadingStats | null>
}) => (
	<div className="leaderboards-screen_wuzsob">
		{props.stats.isLoading || props.leaderboards.isLoading ?
			<LoadingOverlay /> :
			<>
				<div className="panel stats">
					<strong>Your weekly reading stats:</strong>
					{props.stats.value ?
						<ol>
							<li>
								<strong># of Articles:</strong> {props.stats.value.readCount} (ranked {props.stats.value.readCountRank} out of {props.stats.value.userCount})
							</li>
							<li>
								<strong># of Minutes:</strong> {Math.floor(props.stats.value.wordCount / readingParameters.averageWordsPerMinute)} (ranked {props.stats.value.wordCountRank} out of {props.stats.value.userCount})
							</li>
						</ol> :
						props.onGetUser() ?
							<span>Start reading to see your stats</span> :
							<span>Sign up to see your personal reading stats</span>}
				</div>
				<div className="panel leaderboards">
					<strong>Weekly Leaderboards:</strong>
					<ol>
						<li>
							<table>
								<caption>Articles</caption>
								<thead>
									<tr>
										<th>User</th>
										<th># of Articles</th>
									</tr>
								</thead>
								<tbody>
									{props.leaderboards.value.reads.map(row => (
										<tr key={row.name}>
											<td>{row.name}</td>
											<td>{row.readCount}</td>
										</tr>
									))}
								</tbody>
							</table>
						</li>
						<li>
							<table>
								<caption>Minutes</caption>
								<thead>
									<tr>
										<th>User</th>
										<th># of Minutes</th>
									</tr>
								</thead>
								<tbody>
									{props.leaderboards.value.words.map(row => (
										<tr key={row.name}>
											<td>{row.name}</td>
											<td>{Math.floor(row.wordCount / readingParameters.averageWordsPerMinute)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</li>
					</ol>
				</div>
			</>}
	</div>
);