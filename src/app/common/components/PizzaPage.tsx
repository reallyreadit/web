import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Context, { contextTypes } from '../Context';
import ChallengeLeaderboard from '../../../common/models/ChallengeLeaderboard';
import Fetchable from '../api/Fetchable';
import ChallengeResponseAction from '../../../common/models/ChallengeResponseAction';
import { DateTime } from 'luxon';

export default class extends React.Component<RouteComponentProps<{}>, {
	leaderboard: Fetchable<ChallengeLeaderboard>
}> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _forceUpdate = () => {
		this.forceUpdate();
	};
	private readonly _showEnrollPrompt = () => {
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
	private readonly _disenroll = () => {
		this.context.api
			.createChallengeResponse(
				this.context.challenge.activeChallenge.id,
				ChallengeResponseAction.Disenroll
			)
			.then(data => {
				this.context.challenge.update({
					latestResponse: data.response,
					score: null
				});
			});
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
		emptyMessage: string
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
				<td colSpan={3} style={{ textAlign: 'center' }}>{message}</td>
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
			showEnrollPrompt = (
				this.context.challenge.latestResponse &&
				this.context.challenge.latestResponse.action !== ChallengeResponseAction.Enroll
			),
			showDisenrollPrompt = (
				this.context.challenge.latestResponse &&
				this.context.challenge.latestResponse.action === ChallengeResponseAction.Enroll
			);
		return (
			<div className="pizza-page">
				{showEnrollPrompt ?
					<div className="enroll-prompt prompt-wrapper">
						<div className="prompt">
							Want to join the challenge? Click <span onClick={this._showEnrollPrompt}>here</span> to get back in the game!
						</div>
					</div> :
					null}
				<h3>Leaderboards</h3>
				<div className="leaderboards">
					<table className="leaderboard winners">
						<caption>Winners</caption>
						<thead>
							<tr>
								<th>Name</th>
								<th>Winner #</th>
								<th>Date Won</th>
							</tr>
						</thead>
						<tbody>
							{this.getRows(
								board => board.winners.map((winner, index) => (
									<tr key={winner.name}>
										<td>{winner.name}</td>
										<td style={{ textAlign: 'center' }}>{index + 1}</td>
										<td style={{ textAlign: 'right' }}>{DateTime.fromISO(winner.dateAwarded).toFormat('MMM d')}</td>
									</tr>
								)),
								'No winners yet!'
							)}
						</tbody>
					</table>
					<table className="leaderboard contenders">
						<caption>Contenders</caption>
						<thead>
							<tr>
								<th>Name</th>
								<th>Day #</th>
								<th>Level #</th>
							</tr>
						</thead>
						<tbody>
							{this.getRows(
								board => board.contenders.map(contender => (
									<tr key={contender.name}>
										<td>{contender.name}</td>
										<td style={{ textAlign: 'center' }}>{contender.day}</td>
										<td style={{ textAlign: 'center' }}>{contender.level}</td>
									</tr>
								)),
								'Be the first to get on the board!'
							)}
						</tbody>
					</table>
				</div>
				<h3>Challenge Details</h3>
				<p>
					We're giving away free pizzas to the first 100 users who read at least one
					article per day for 10 days in a row!
				</p>
				<p>
					The article must be at least five minutes long.
				</p>
				<p>
					If you read more than one five minute article in a given day the extra reads
					do not carry over to the next day.
				</p>
				<p>
					If you miss a day you have to start all over again from the beginning!
				</p>
				<p>
					<strong>Protip:</strong> Make sure you are getting credit for the articles you are
					reading! We're still in beta and while our tracker works on most articles it is not
					perfect!
				</p>
				<h4>FAQ</h4>
				<ol className="faq">
					<li>
						<span>How do I know I'm getting credit for the articles I'm reading?</span>
						<span>
							When the Chrome extension detects an article it displays the reallyread.it
							comment counter over the extension icon. Click on the extension icon and you
							should see the article details along with your progress.
						</span>
					</li>
					<li>
						<span>How do I claim my pizza?</span>
						<span>We'll reach out to you within 24 hours of your win in order to make arrangements.</span>
					</li>
					<li>
						<span>What kind of pizza do I get?</span>
						<span>
							Winning the challenge gets you $15 towards the pizza of your choice.
							We can either send you an e-gift certificate for a major pizza chain or
							make arrangements with your favorite local pizza place.
						</span>
					</li>
				</ol>
				{showDisenrollPrompt ?
					<div className="disenroll-prompt prompt-wrapper">
						<div className="prompt">
							Want to quit the challenge? Click <span onClick={this._disenroll}>here</span> to leave the game.
						</div>
					</div> :
					null}
			</div>
		);
	}
}