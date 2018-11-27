import * as React from 'react';
import ChallengeLeaderboard from '../../../../common/models/ChallengeLeaderboard';
import Fetchable from '../../serverApi/Fetchable';
import ChallengeResponseAction from '../../../../common/models/ChallengeResponseAction';
import { DateTime } from 'luxon';
import classNames from 'classnames';
import ChallengeView from '../PizzaPage/ChallengeView';
import RefreshButton from '../controls/RefreshButton';
import UserAccount from '../../../../common/models/UserAccount';
import ChallengeState from '../../../../common/models/ChallengeState';

interface Props {
	challengeState: Fetchable<ChallengeState>,
	leaderboard: Fetchable<ChallengeLeaderboard>,
	onQuitChallenge: () => void,
	onRefreshLeaderboard: () => void,
	onStartChallenge: () => void,
	user: UserAccount | null
}
export default class extends React.Component<Props> {
	private readonly _quit = () => {
		if (
			this.props.challengeState.value &&
			this.props.challengeState.value.latestResponse &&
			this.props.challengeState.value.latestResponse.action === ChallengeResponseAction.Enroll ?
				window.confirm('Are you sure? You\'ll lose any progress you\'ve made so far!') :
				true
		) {
			this.props.onQuitChallenge();
		}
	};
	constructor(props: Props) {
		super(props);
	}
	private mergeLeaderboard(leaderboard: Fetchable<ChallengeLeaderboard>) {
		const user = this.props.user;
		if (leaderboard.value && user && this.props.challengeState.value && this.props.challengeState.value.score) {
			const
				userName = user.name,
				score = this.props.challengeState.value.score,
				contenders = leaderboard.value.contenders,
				contenderIndex = contenders.findIndex(contender => contender.name === userName);
			if (score.level === 0 || score.level === 10) {
				if (contenderIndex !== -1) {
					contenders.splice(contenderIndex, 1);
				}
				if (score.level === 10) {
					const
						winners = leaderboard.value.winners,
						winnerIndex = winners.findIndex(winner => winner.name === userName);
					if (winnerIndex === -1) {
						winners.push({
							name: userName,
							dateAwarded: new Date().toISOString()
						});
						winners.sort((a, b) => {
							if (a.dateAwarded < b.dateAwarded) {
								return -1;
							}
							if (a.dateAwarded > b.dateAwarded) {
								return 1;
							}
							return 0;
						});
					}
				}
			} else {
				if (contenderIndex !== -1) {
					contenders[contenderIndex].day = score.day;
					contenders[contenderIndex].level = score.level;
				} else {
					contenders.push({
						name: userName,
						day: score.day,
						level: score.level
					});
				}
				contenders.sort((a, b) => {
					if (a.level < b.level) {
						return 1;
					}
					if (a.level > b.level) {
						return -1;
					}
					if (a.day < b.day) {
						return -1;
					}
					if (a.day > b.day) {
						return 1;
					}
					const
						nameA = a.name.toLowerCase(),
						nameB = b.name.toLowerCase();
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}
					return 0;
				});
			}
		}
		return leaderboard;
	}
	private getRows(
		mergedLeaderboard: Fetchable<ChallengeLeaderboard>,
		delegate: (leaderboard: ChallengeLeaderboard) => React.ReactNode[],
		emptyMessage: string,
		columnCount: number
	) {
		let message: string;
		if (mergedLeaderboard.isLoading) {
			message = 'Loading...';
		} else if (mergedLeaderboard.errors) {
			message = 'Error loading leaderboard.';
		}
		if (!message) {
			const rows = delegate(mergedLeaderboard.value);
			if (rows.length) {
				return rows;
			}
			message = emptyMessage;
		}
		return (
			<tr>
				<td colSpan={columnCount} style={{ textAlign: 'center' }}>{message}</td>
			</tr>
		);
	}
	public render() {
		const
			user = this.props.user,
			showQuitPrompt = (
				user &&
				this.props.challengeState.value &&
				this.props.challengeState.value.latestResponse &&
				this.props.challengeState.value.latestResponse.action === ChallengeResponseAction.Enroll
			),
			userName = user ? user.name : null,
			mergedLeaderboard = this.mergeLeaderboard(this.props.leaderboard);
		return (
			<div className="pizza-screen_vkc6ks">
				<ChallengeView
					challengeState={this.props.challengeState}
					onStartChallenge={this.props.onStartChallenge}
					user={user}
				/>
				<h3>We're giving away free pizza to the first 100 people who read at least one article* per day for 10 days in a row!</h3>
				<p>*The article must be at least five minutes long.</p>
				<h4>
					<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
				</h4>
				<h3>
					Leaderboards
					<RefreshButton
						isLoading={this.props.leaderboard.isLoading}
						onClick={this.props.onRefreshLeaderboard}
					/>
				</h3>
				<div className="leaderboards">
					<div className="container">
						<table className="leaderboard winners">
							<caption>Winners</caption>
							<thead>
								<tr>
									<th>#</th>
									<th>Name</th>
									<th>Date Won</th>
								</tr>
							</thead>
							<tbody>
								{this.getRows(
									mergedLeaderboard,
									board => board.winners.map((winner, index) => (
										<tr
											key={winner.name}
											className={classNames({ 'highlight': winner.name === userName })}
										>
											<td style={{ textAlign: 'center' }}>{index + 1}</td>
											<td>{winner.name}</td>
											<td style={{ textAlign: 'right' }}>{DateTime.fromISO(winner.dateAwarded).toFormat('MMM d')}</td>
										</tr>
									)),
									'No winners yet!',
									3
								)}
							</tbody>
						</table>
					</div>
					<div className="container">
						<table className="leaderboard contenders">
							<caption>Contenders</caption>
							<thead>
								<tr>
									<th>#</th>
									<th>Name</th>
									<th>Day #</th>
									<th>Level #</th>
								</tr>
							</thead>
							<tbody>
								{this.getRows(
									mergedLeaderboard,
									board => board.contenders.map((contender, index) => (
										<tr
											key={contender.name}
											className={classNames({ 'highlight': contender.name === userName })}
										>
											<td style={{ textAlign: 'center' }}>{index + 1}</td>
											<td>{contender.name}</td>
											<td style={{ textAlign: 'center' }}>{contender.day}</td>
											<td style={{ textAlign: 'center' }}>{contender.level}</td>
										</tr>
									)),
									'Be the first to get on the board!',
									4
								)}
							</tbody>
						</table>
					</div>
				</div>
				{showQuitPrompt ?
					<div className="quit-prompt prompt-wrapper">
						<div className="prompt">
							Want to quit the challenge? Click <span onClick={this._quit}>here</span> to leave the game.
						</div>
					</div> :
					null}
			</div>
		);
	}
}