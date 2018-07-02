import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import ChallengeLeaderboard from '../../../common/models/ChallengeLeaderboard';
import Fetchable from '../api/Fetchable';
import ChallengeResponseAction from '../../../common/models/ChallengeResponseAction';
import { DateTime } from 'luxon';
import * as className from 'classnames';
import ChallengeView from './PizzaPage/ChallengeView';

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
		this.context.page.setState({ isLoading: true });
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
	private fetchLeaderboard() {
		return this.context.api.getChallengeLeaderboard(
			this.context.challenge.activeChallenge.id,
			leaderboard => {
				this.setState({ leaderboard });
				this.context.page.setState({ isLoading: false });
			}
		);
	}
	private getRows(
		delegate: (leaderboard: ChallengeLeaderboard) => React.ReactNode[],
		emptyMessage: string,
		columnCount: number
	) {
		let message: string;
		if (this.state.leaderboard.isLoading) {
			message = 'Loading...';
		} else if (this.state.leaderboard.errors) {
			message = 'Error loading leaderboard.';
		}
		if (!message) {
			const rows = delegate(this.state.leaderboard.value);
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
		this.context.page.setState({
			title: 'Pizza Challenge',
			isLoading: this.state.leaderboard.isLoading,
			isReloadable: true
		});
	}
	public componentDidMount() {
		this.context.page.addListener('reload', this._refresh);
		this.context.challenge.addListener('change', this._forceUpdate);
	}
	public componentWillUnmount() {
		this.context.page.removeListener('reload', this._refresh);
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
			userName = this.context.user.isSignedIn ? this.context.user.userAccount.name : null;
		return (
			<div className="pizza-page">
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
					<small>Updated every 5 min.</small>
				</h3>
				<div className="leaderboards">
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