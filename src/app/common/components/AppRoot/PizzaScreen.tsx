import * as React from 'react';
import ChallengeLeaderboard from '../../../../common/models/ChallengeLeaderboard';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import TimeZoneSelectListItem from '../../../../common/models/TimeZoneSelectListItem';
import CallbackStore from '../../CallbackStore';
import ChallengeState from '../../../../common/models/ChallengeState';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import PizzaScreen from '../screens/PizzaScreen';
import ChallengeScore from '../../../../common/models/ChallengeScore';
import ChallengeResponse from '../../../../common/models/ChallengeResponse';

interface Props {
	onGetChallengeLeaderboard: FetchFunctionWithParams<{ challengeId: number }, ChallengeLeaderboard>,
	onGetChallengeState: FetchFunction<ChallengeState>,
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>,
	onGetUserAccount: () => UserAccount | null,
	onQuitChallenge: (challengeId: number) => Promise<ChallengeResponse>,
	onStartChallenge: (challengeId: number, timeZoneId: number) => Promise<{ response: ChallengeResponse, score: ChallengeScore }>
}
export class AppPizzaScreen extends React.Component<
	Props,
	{
		challengeState: Fetchable<ChallengeState>,
		leaderboard: Fetchable<ChallengeLeaderboard>
	}
	> {
	private readonly _callbacks = new CallbackStore();
	private readonly _refreshLeaderboard = () => {
		this.setState({
			leaderboard: this.props.onGetChallengeLeaderboard(
				{ challengeId: 1 },
				this._callbacks.add(leaderboard => {
					this.setState({ leaderboard });
				})
			)
		});
	};
	private readonly _startChallenge = (timeZoneId: number) => {
		this.props
			.onStartChallenge(1, timeZoneId)
			.then(this._callbacks.add(({ response, score }) => {
				this.setState({
					challengeState: {
						...this.state.challengeState,
						latestResponse: response,
						score
					}
				});
			}));
	};
	private readonly _quitChallenge = () => {
		this.props
			.onQuitChallenge(1)
			.then(this._callbacks.add(latestResponse => {
				this.setState({
					challengeState: {
						...this.state.challengeState,
						latestResponse,
						score: null
					}
				});
			}));
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			challengeState: props.onGetChallengeState(this._callbacks.add(challengeState => {
				this.setState({
					challengeState
				});
			})),
			leaderboard: this.props.onGetChallengeLeaderboard(
				{ challengeId: 1 },
				this._callbacks.add(leaderboard => {
					this.setState({ leaderboard });
				})
			)
		};
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
	}
	public render() {
		return (
			<PizzaScreen
				challengeState={this.state.challengeState}
				leaderboard={this.state.leaderboard}
				onGetTimeZones={this.props.onGetTimeZones}
				onGetUserAccount={this.props.onGetUserAccount}
				onQuitChallenge={this._quitChallenge}
				onRefreshLeaderboard={this._refreshLeaderboard}
				onStartChallenge={this._startChallenge}
			/>
		);
	}
}
export default function <TScreenKey>(key: TScreenKey, deps: Props) {
	return {
		create: () => ({ key, title: 'Leaderboards' }),
		render: () => (
			<AppPizzaScreen {...deps} />
		)
	};
}