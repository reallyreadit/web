import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import LoadingOverlay from '../controls/LoadingOverlay';
import UserAccount from '../../../../common/models/UserAccount';
import Leaderboards from '../../../../common/models/Leaderboards';
import ScreenContainer from '../ScreenContainer';
import { formatCountable } from '../../../../common/format';
import Icon, { IconName } from '../../../../common/components/Icon';
import LeaderboardRanking from '../../../../common/models/LeaderboardRanking';
import Ranking from '../../../../common/models/Ranking';
import classNames from 'classnames';
import StreakTimer from './LeaderboardScreen/StreakTimer';

function renderTable(
	{ title, iconName, scoreUnit, pluralScoreUnit, rankings, userRanking, userName, onOpenExplainer }: {
		title: string,
		iconName: IconName,
		scoreUnit: string,
		pluralScoreUnit?: string,
		rankings: LeaderboardRanking[],
		userRanking: Ranking,
		userName: string,
		onOpenExplainer?: () => void
	}
) {
	return (
		<>
			<div className="title">
				<Icon
					className="icon"
					name={iconName}
				/>
				<span className="text">{title}</span>
				{onOpenExplainer ?
					<Icon
						className="icon"
						name="question-circle"
						onClick={onOpenExplainer}
					/> :
					null}
			</div>
			<div className={classNames('table-container', { 'overflowing': rankings.length > 5 })}>
				<table>
					<tbody>
						{rankings.map(
							ranking => (
								<tr key={ranking.rank + ranking.userName + ranking.score}>
									<td>{ranking.rank}</td>
									<td>
										<span className="cell-liner">
											<span className="overflow-container">{ranking.userName}</span>
										</span>
									</td>
									<td>{ranking.score} {formatCountable(ranking.score, scoreUnit, pluralScoreUnit)}</td>
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
						<td>{userRanking.rank}</td>
						<td>
							<span className="cell-liner">
								<span className="overflow-container">{userName}</span>
							</span>
						</td>
						<td>{userRanking.score} {formatCountable(userRanking.score, scoreUnit, pluralScoreUnit)}</td>
					</tr>
				</tbody>
			</table>
		</>
	);
}
interface Props {
	leaderboards: Fetchable<Leaderboards>,
	user: UserAccount
}
export default class LeaderboardsScreen extends React.PureComponent<
	Props,
	{
		explainer: 'scout' | 'scribe' | null
	}
> {
	private readonly _closeExplainer = () => {
		this.setState({ explainer: null });
	};
	private readonly _openScoutExplainer = () => {
		this.setState({ explainer: 'scout' });
	};
	private readonly _openScribeExplainer = () => {
		this.setState({ explainer: 'scribe' });
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			explainer: null
		};
	}
	public render() {
		const streak = (
			this.props.leaderboards.value ?
				this.props.leaderboards.value.userRankings.streak :
				null
		);
		let explainer: {
			title: string,
			content: React.ReactNode
		};
		switch (this.state.explainer) {
			case 'scout':
				explainer = {
					title: 'What\'s a scout?',
					content: (
						<p><strong>Scouts find the good stuff. They're the first ones to read <em>and rate</em> new articles that go on to become Article of the Day (AOTD). The leaderboard shows the top Scouts of the last month.</strong></p>
					)
				};
				break;
			case 'scribe':
				explainer = {
					title: 'What\'s a scribe?',
					content: (
						<>
							<p><strong>Thoughtful, interesting conversation is the heart and soul of Readup. Scribes are the top commenters of the past month.</strong></p>
							<p>Scribes earn replies in two ways: (1) by replying to others and (2) by getting replies on their comments.</p>
						</>
					)
				};
				break;
		}
		return (
			<ScreenContainer className="leaderboards-screen_wuzsob">
				{this.props.leaderboards.isLoading ?
					<LoadingOverlay /> :
					!this.props.leaderboards.value.userRankings.readCount.score ?
						<div className="placeholder">
							<img
								alt="Padlock"
								src="/images/padlock.svg"
							/>
							Read at least one full article to unlock the leaderboards.
						</div> :
						<div className="leaderboards">
							<div className="leaderboard">
								{renderTable({
									title: 'Top readers this week',
									iconName: 'medal',
									scoreUnit: 'read',
									rankings: this.props.leaderboards.value.weeklyReadCount,
									userRanking: this.props.leaderboards.value.userRankings.weeklyReadCount,
									userName: this.props.user.name
								})}
							</div>
							<div className="leaderboard">
								{renderTable({
									title: 'Top readers of all time',
									iconName: 'trophy',
									scoreUnit: 'read',
									rankings: this.props.leaderboards.value.readCount,
									userRanking: this.props.leaderboards.value.userRankings.readCount,
									userName: this.props.user.name
								})}
							</div>
							<div className="leaderboard">
								{renderTable({
									title: 'Reading streaks',
									iconName: 'fire',
									scoreUnit: 'day',
									rankings: this.props.leaderboards.value.streak,
									userRanking: {
										score: streak.dayCount,
										rank: streak.rank
									},
									userName: this.props.user.name
								})}
								{streak.dayCount ?
									<div className="streak-status">
										<div className="text">
											{streak.includesToday ?
												'You\'re safe until tomorrow' :
												`Don\'t lose your ${streak.dayCount} day streak!`}
										</div>
										{!streak.includesToday ?
											<div className="timer">
												<StreakTimer
													timeZoneName={this.props.user.timeZoneName}
												/>
											</div> :
											null}
									</div> :
									null}
							</div>
							<div className="leaderboard">
								{renderTable({
									title: 'Scouts',
									iconName: 'binoculars',
									scoreUnit: 'AOTD',
									rankings: this.props.leaderboards.value.scout,
									userRanking: this.props.leaderboards.value.userRankings.scoutCount,
									userName: this.props.user.name,
									onOpenExplainer: this._openScoutExplainer
								})}
							</div>
							<div className="leaderboard">
								{renderTable({
									title: 'Scribes',
									iconName: 'quill',
									scoreUnit: 'reply',
									pluralScoreUnit: 'replies',
									rankings: this.props.leaderboards.value.scribe,
									userRanking: this.props.leaderboards.value.userRankings.scribeCount,
									userName: this.props.user.name,
									onOpenExplainer: this._openScribeExplainer
								})}
							</div>
							<div className="leaderboard hidden"></div>
						</div>}
				{explainer ?
							<div className="explainer">
								<div className="content">
									<div className="title">
										{explainer.title}
										<Icon
											className="close"
											name="cancel"
											onClick={this._closeExplainer}
										/>
									</div>
									{explainer.content}
								</div>
							</div> :
							null}
			</ScreenContainer>
		);
	}
}