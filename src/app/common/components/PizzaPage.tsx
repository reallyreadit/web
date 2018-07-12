import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import ChallengeLeaderboard from '../../../common/models/ChallengeLeaderboard';
import Fetchable from '../api/Fetchable';
import ChallengeResponseAction from '../../../common/models/ChallengeResponseAction';
import { DateTime } from 'luxon';
import * as className from 'classnames';
import ChallengeView from './PizzaPage/ChallengeView';
import RefreshButton from './controls/RefreshButton';
import Page from './Page';

export default class extends React.Component<RouteComponentProps<{}>, {
	leaderboard: Fetchable<ChallengeLeaderboard>
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => {
		this.forceUpdate();
	};
	private readonly _showStartPrompt = () => {
		this.context.challenge.update({
			latestResponse: null
		});
	};
	private readonly _refresh = () => {
		this.setState({
			leaderboard: this.fetchLeaderboard()
		});
	};
	private readonly _quit = () => {
		if (
			this.context.challenge.isUserEnrolled ?
				window.confirm('Are you sure? You\'ll lose any progress you\'ve made so far!') :
				true
		) {
			this.context.api
				.quitChallenge(this.context.challenge.activeChallenge.id)
				.then(latestResponse => {
					this.context.challenge.update({
						latestResponse,
						score: null
					});
				});
		}
	};
	constructor(props: RouteComponentProps<{}>, context: Context) {
		super(props, context);
		this.state = {
			leaderboard: this.fetchLeaderboard()
		};
	}
	private mergeLeaderboard(leaderboard: Fetchable<ChallengeLeaderboard>) {
		if (leaderboard.value && this.context.user.isSignedIn && this.context.challenge.score) {
			const
				userName = this.context.user.userAccount.name,
				score = this.context.challenge.score,
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
	private fetchLeaderboard() {
		return this.context.api.getChallengeLeaderboard(
			this.context.challenge.activeChallenge.id,
			leaderboard => {
				this.setState({ leaderboard });
			}
		);
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
	public componentWillMount() {
		this.context.page.setTitle('Pizza Challenge');
	}
	public componentDidMount() {
		this.context.challenge.addListener('change', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.challenge.removeListener('change', this._forceUpdate);
	}
	public render() {
		const
			showStartPrompt = (
				this.context.challenge.latestResponse &&
				this.context.challenge.latestResponse.action !== ChallengeResponseAction.Enroll
			),
			showQuitPrompt = (
				this.context.user.isSignedIn && (
					!this.context.challenge.latestResponse ||
					this.context.challenge.latestResponse.action === ChallengeResponseAction.Enroll
				)
			),
			userName = this.context.user.isSignedIn ? this.context.user.userAccount.name : null,
			mergedLeaderboard = this.mergeLeaderboard(this.state.leaderboard);
		return (
			<Page className="pizza-page">
				{showStartPrompt ?
					<div className="start-prompt prompt-wrapper">
						<div className="prompt">
							Want to join the challenge? Click <span onClick={this._showStartPrompt}>here</span> to get back in the game!
						</div>
					</div> :
					null}
				<ChallengeView />
				<h3>We're giving away free pizza to the first 100 people who read at least one article* per day for 10 days in a row!</h3>
				<p>*The article must be at least five minutes long.</p>
				<h4>
					<a href="https://blog.reallyread.it/beta/2017/07/12/FAQ.html">FAQ</a>
				</h4>
				<h3>
					Leaderboards
					<RefreshButton
						isLoading={this.state.leaderboard.isLoading}
						onClick={this._refresh}
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
											className={className({ 'highlight': winner.name === userName })}	
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
											className={className({ 'highlight': contender.name === userName })}
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
			</Page>
		);
	}
}