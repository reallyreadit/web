import * as React from 'react';
import ChallengeLeaderboard from '../../../../common/models/ChallengeLeaderboard';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import AsyncTracker from '../../AsyncTracker';
import ChallengeState from '../../../../common/models/ChallengeState';
import { FetchFunction, FetchFunctionWithParams } from '../../serverApi/ServerApi';
import PizzaScreen from '../screens/PizzaScreen';
import ChallengeResponse from '../../../../common/models/ChallengeResponse';
import ChallengeScore from '../../../../common/models/ChallengeScore';
import UserArticle from '../../../../common/models/UserArticle';
import produce from 'immer';
import { Screen, RootState } from '../Root';

interface Props {
	onGetChallengeLeaderboard: FetchFunctionWithParams<{ challengeId: number }, ChallengeLeaderboard>,
	onGetChallengeScore: FetchFunctionWithParams<{ challengeId: number }, ChallengeScore>,
	onGetChallengeState: FetchFunction<ChallengeState>,
	onQuitChallenge: (challengeId: number) => Promise<ChallengeResponse>,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle, isCompletionCommit: boolean) => void) => Function,
	onRegisterUserChangeHandler: (handler: () => void) => Function,
	onStartChallenge: (challengeId: number) => Promise<{ response: ChallengeResponse, score: ChallengeScore}>,
	user: UserAccount | null
}
interface State {
	challengeState: Fetchable <ChallengeState>,
	leaderboard: Fetchable<ChallengeLeaderboard>
}
export class BrowserPizzaScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _refreshLeaderboard = () => {
		this.setState({
			leaderboard: this.props.onGetChallengeLeaderboard(
				{ challengeId: 1 },
				this._asyncTracker.addCallback(leaderboard => {
					this.setState({ leaderboard });
				})
			)
		});
	};
	private readonly _startChallenge = () => {
		this.props
			.onStartChallenge(1)
			.then(this._asyncTracker.addCallback(({ response, score }) => {
				this.setState(produce<State>(prevState => {
					prevState.challengeState.value.latestResponse = response;
					prevState.challengeState.value.score = score;
				}));
			}));
	};
	private readonly _quitChallenge = () => {
		this.props
			.onQuitChallenge(1)
			.then(this._asyncTracker.addCallback(latestResponse => {
				this.setState(produce<State>(prevState => {
					prevState.challengeState.value.latestResponse = latestResponse;
					prevState.challengeState.value.score = null;
				}));
			}));
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			challengeState: props.onGetChallengeState(this._asyncTracker.addCallback(challengeState => {
				this.setState({
					challengeState
				});
			})),
			leaderboard: this.props.onGetChallengeLeaderboard(
				{ challengeId: 1 },
				this._asyncTracker.addCallback(leaderboard => {
					this.setState({ leaderboard });
				})
			)
		};
		this._asyncTracker.addCancellationDelegate(
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
			}),
			props.onRegisterUserChangeHandler(() => {
				this.setState({
					challengeState: this.props.onGetChallengeState(this._asyncTracker.addCallback(challengeState => {
						this.setState({ challengeState });
					}))
				});
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<PizzaScreen
				challengeState={this.state.challengeState}
				leaderboard={this.state.leaderboard}
				onQuitChallenge={this._quitChallenge}
				onRefreshLeaderboard={this._refreshLeaderboard}
				onStartChallenge={this._startChallenge}
				user={this.props.user}
			/>
		);
	}
}
export default function <TScreenKey>(key: TScreenKey, deps: Pick<Props, Exclude<keyof Props, 'user'>>) {
	return {
		create: () => ({ key, title: 'Pizza Challenge' }),
		render: (screenState: Screen, rootState: RootState) => (
			<BrowserPizzaScreen {...{ ...deps, user: rootState.user }} />
		)
	};
}