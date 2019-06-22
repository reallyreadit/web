import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';
import Leaderboards from '../../../../common/models/Leaderboards';
import ScreenContainer from '../ScreenContainer';
import { formatCountable } from '../../../../common/format';

export default (props: {
	leaderboards: Fetchable<Leaderboards>,
	user: UserAccount
}) => (
	<ScreenContainer>
		<div className="leaderboards-screen_wuzsob">
			{props.leaderboards.isLoading ?
				<LoadingOverlay /> :
				<>
					<div className="panel leaderboard">
						<table>
							<caption>Reading Streaks</caption>
							<tbody>
								{props.leaderboards.value.streak.map(
									(row, index) => (
										<tr key={row.name}>
											<td>{index + 1}</td>
											<td>{row.name}</td>
											<td>{row.streak.toLocaleString()} {formatCountable(row.streak, 'day')}</td>
										</tr>
									)
								)}
							</tbody>
							<tfoot>
								<tr>
									<td>
										{props.leaderboards.value.userRankings.streak ?
											props.leaderboards.value.userRankings.streak.rank :
											0}
									</td>
									<td>{props.user.name}</td>
									<td>
										{props.leaderboards.value.userRankings.streak ?
											`${props.leaderboards.value.userRankings.streak.value} ${formatCountable(props.leaderboards.value.userRankings.streak.value, 'day')}` :
											'0 days'}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
					<div className="panel leaderboard">
						<table>
							<caption>Top Readers of All Time</caption>
							<tbody>
								{props.leaderboards.value.readCount.map(
									(row, index) => (
										<tr key={row.name}>
											<td>{index + 1}</td>
											<td>{row.name}</td>
											<td>{row.readCount.toLocaleString()} {formatCountable(row.readCount, 'read')}</td>
										</tr>
									)
								)}
							</tbody>
							<tfoot>
								<tr>
									<td>{props.leaderboards.value.userRankings.readCount.rank}</td>
									<td>{props.user.name}</td>
									<td>{props.leaderboards.value.userRankings.readCount.value} {formatCountable(props.leaderboards.value.userRankings.readCount.value, 'read')}</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</>}
		</div>
	</ScreenContainer>
);