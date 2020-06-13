import * as React from 'react';
import Icon, { IconName } from '../../../../../common/components/Icon';
import LeaderboardRanking from '../../../../../common/models/LeaderboardRanking';
import Ranking from '../../../../../common/models/Ranking';
import * as classNames from 'classnames';
import ProfileLink from '../../../../../common/components/ProfileLink';
import { formatCountable } from '../../../../../common/format';

export default (
	props: {
		footer?: React.ReactNode,
		iconName: IconName,
		onCreateAbsoluteUrl: (path: string) => string,
		onOpenExplainer?: () => void,
		onViewProfile: (userName: string) => void,
		pluralScoreUnit?: string,
		scoreUnit: string,
		rankings: LeaderboardRanking[],
		title: string,
		userRanking: Ranking,
		userName: string
	}
) => (
	<div className="leaderboard_w540wu">
		<div className="title">
			<Icon
				className="icon"
				name={props.iconName}
			/>
			<span className="text">{props.title}</span>
			{props.onOpenExplainer ?
				<Icon
					className="icon"
					name="question-circle"
					onClick={props.onOpenExplainer}
				/> :
				null}
		</div>
		<div className={classNames('table-container', { 'overflowing': props.rankings.length > 5 })}>
			<table>
				<tbody>
					{props.rankings.map(
						ranking => (
							<tr key={ranking.rank + ranking.userName + ranking.score}>
								<td>{ranking.rank}</td>
								<td>
									<span className="cell-liner">
										<span className="overflow-container">
											{ranking.userName !== props.userName ?
												<ProfileLink
													className="profile-link"
													onCreateAbsoluteUrl={props.onCreateAbsoluteUrl}
													onViewProfile={props.onViewProfile}
													userName={ranking.userName}
												/> :
												ranking.userName}
										</span>
									</span>
								</td>
								<td>{ranking.score} {formatCountable(ranking.score, props.scoreUnit, props.pluralScoreUnit)}</td>
							</tr>
						)
					)}
				</tbody>
			</table>
		</div>
		<hr className="break" />
		<table>
			<tbody>
				<tr>
					<td>{props.userRanking.rank}</td>
					<td>
						<span className="cell-liner">
							<span className="overflow-container">{props.userName}</span>
						</span>
					</td>
					<td>{props.userRanking.score} {formatCountable(props.userRanking.score, props.scoreUnit, props.pluralScoreUnit)}</td>
				</tr>
			</tbody>
		</table>
		<div className="footer">
			{props.footer}
		</div>
	</div>
);