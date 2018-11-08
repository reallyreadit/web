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
import EventHandlerStore from '../../EventHandlerStore';
import produce from 'immer';
import UserArticle from '../../../../common/models/UserArticle';

interface Props {
	onGetChallengeLeaderboard: FetchFunctionWithParams<{ challengeId: number }, ChallengeLeaderboard>,
	onGetChallengeScore: FetchFunctionWithParams<{ challengeId: number }, ChallengeScore>,
	onGetChallengeState: FetchFunction<ChallengeState>,
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>,
	onGetUserAccount: () => UserAccount | null,
	onQuitChallenge: (challengeId: number) => Promise<ChallengeResponse>,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle, isCompletionCommit: boolean) => void) => Function,
	onStartChallenge: (challengeId: number, timeZoneId: number) => Promise<{ response: ChallengeResponse, score: ChallengeScore }>
}
interface State {
	challengeState: Fetchable<ChallengeState>,
	leaderboard: Fetchable<ChallengeLeaderboard>
}
export class AppPizzaScreen extends React.Component<Props, State> {
	private readonly _callbacks = new CallbackStore();
	private readonly _eventHandlers = new EventHandlerStore();
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
		this._eventHandlers.add(
			props.onRegisterArticleChangeHandler((article, isCompletionCommit) => {
				if (isCompletionCommit) {
					this.setState(
						produce<State>(prevState => {
							prevState.challengeState.isLoading = true
						}),
						() => {
							this.props.onGetChallengeScore({ challengeId: 1 }, score => {
								this.setState(produce<State>(prevState => {
									prevState.challengeState.isLoading = false;
									prevState.challengeState.value.score = score.value;
								}));
							});
						}
					);
				}
			})
		);
	}
	public componentWillUnmount() {
		this._callbacks.cancel();
		this._eventHandlers.unregister();
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