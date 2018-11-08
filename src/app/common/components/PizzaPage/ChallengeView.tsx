import * as React from 'react';
import ChallengeResponseAction from '../../../../common/models/ChallengeResponseAction';
import EnrollmentPromptScreen from './ChallengeView/EnrollmentPromptScreen';
import EnrollScreen from './ChallengeView/EnrollScreen';
import GameScene from './ChallengeView/GameScene';
import UserAccount from '../../../../common/models/UserAccount';
import LoadingScreen from './ChallengeView/LoadingScreen';
import Fetchable from '../../serverApi/Fetchable';
import TimeZoneSelectListItem from '../../../../common/models/TimeZoneSelectListItem';
import ChallengeState from '../../../../common/models/ChallengeState';
import { FetchFunction } from '../../serverApi/ServerApi';

interface Props {
	challengeState: Fetchable<ChallengeState>,
	onGetTimeZones: FetchFunction<TimeZoneSelectListItem[]>,
	onStartChallenge: (timeZoneId: number) => void,
	user: UserAccount
}
interface State {
	isEnrolling: boolean
}
export default class extends React.PureComponent<Props, State> {
	public static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
		if (
			state.isEnrolling &&
			(!props.user || (props.challengeState.value && props.challengeState.value.latestResponse && props.challengeState.value.latestResponse.action === ChallengeResponseAction.Enroll))
		) {
			return { isEnrolling: false };
		}
		return null;
	}
	private readonly _reset = () => {
		if (this.state.isEnrolling) {
			this.setState({ isEnrolling: false });
		}
	};
	private readonly _startEnrollment = () => {
		this.setState({ isEnrolling: true });
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isEnrolling: false
		};
	}
	public render() {
		let
			menuScreen: React.ReactNode | null = null,
			timeZoneName: string | null = null;
		if (this.props.challengeState.isLoading) {
			menuScreen = (
				<LoadingScreen />
			);
		} else if (this.state.isEnrolling) {
			menuScreen = (
				<EnrollScreen
					onCancel={this._reset}
					onGetTimeZones={this.props.onGetTimeZones}
					onStartChallenge={this.props.onStartChallenge}
				/>
			);
		} else if (!this.props.challengeState.value.latestResponse || this.props.challengeState.value.latestResponse.action !== ChallengeResponseAction.Enroll) {
			menuScreen = (
				<EnrollmentPromptScreen
					isUserSignedIn={!!this.props.user}
					isUserEmailConfirmed={
						this.props.user ?
							this.props.user.isEmailConfirmed :
							false
					}
					onEnroll={this._startEnrollment}
				/>
			);
		}
		if (this.props.challengeState.value && this.props.challengeState.value.latestResponse) {
			timeZoneName = this.props.challengeState.value.latestResponse.timeZoneName;
		}
		return (
			<div className="challenge-view">
				<GameScene
					score={this.props.challengeState.value ? this.props.challengeState.value.score : null}
					timeZoneName={timeZoneName}
				/>
				{menuScreen ?
					<div className="overlay">
						<div className="menu">
							{menuScreen}
						</div>
					</div> :
					null}
			</div>
		);
	}
}