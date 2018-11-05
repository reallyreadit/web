import * as React from 'react';
import Fetchable from '../serverApi/Fetchable';
import UserWeeklyReadingStats from '../../../common/models/UserWeeklyReadingStats';
import WeeklyReadingLeaderboards from '../../../common/models/WeeklyReadingLeaderboards';
import LoadingOverlay from './controls/LoadingOverlay';
import { FetchFunction } from '../serverApi/ServerApi';
import readingParameters from '../../../common/readingParameters';

export function createScreenFactory<TScreenKey>(key: TScreenKey, deps: {
	onGetWeeklyReadingLeaderboards: FetchFunction<WeeklyReadingLeaderboards>,
	onGetWeeklyReadingStats: FetchFunction<UserWeeklyReadingStats | null>
}) {
	return {
		create: () => ({ key, title: 'Leaderboards' }),
		render: () => (
			<LeaderboardsPage
				onGetLeaderboards={deps.onGetWeeklyReadingLeaderboards}
				onGetStats={deps.onGetWeeklyReadingStats}
			/>
		)
	};
}
interface Props {
	onGetLeaderboards: FetchFunction<WeeklyReadingLeaderboards>,
	onGetStats: FetchFunction<UserWeeklyReadingStats | null>
}
export default class LeaderboardsPage extends React.PureComponent<Props, {
	leaderboards: Fetchable<WeeklyReadingLeaderboards>,
	stats: Fetchable<UserWeeklyReadingStats | null>
}> {
	constructor(props: Props) {
		super(props);
		this.state = {
			leaderboards: props.onGetLeaderboards(leaderboards => { this.setState({ leaderboards }) }),
			stats: props.onGetStats(stats => { this.setState({ stats }) })
		};
	}
	public render() {
		return (
			<div className="leaderboards-page_872eby">
				{this.state.stats.isLoading || this.state.leaderboards.isLoading ?
					<LoadingOverlay /> :
					<>
						<div className="panel stats">
							<strong>Your weekly reading stats:</strong>
							{this.state.stats.value ?
								<ol>
									<li>
										<strong># of Articles:</strong> {this.state.stats.value.readCount} (ranked {this.state.stats.value.readCountRank} out of {this.state.stats.value.userCount})
									</li>
									<li>
										<strong># of Minutes:</strong> {Math.floor(this.state.stats.value.wordCount / readingParameters.averageWordsPerMinute)} (ranked {this.state.stats.value.wordCountRank} out of {this.state.stats.value.userCount})
									</li>
								</ol> :
								<span>You haven't read an article in the past 7 days :(</span>}
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
											{this.state.leaderboards.value.reads.map(row => (
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
											{this.state.leaderboards.value.words.map(row => (
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
	}
}