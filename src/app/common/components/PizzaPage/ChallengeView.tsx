import * as React from 'react';
import ChallengeResponseAction from '../../../../common/models/ChallengeResponseAction';
import EnrollmentPromptScreen from './ChallengeView/EnrollmentPromptScreen';
import GameScene from './ChallengeView/GameScene';
import UserAccount from '../../../../common/models/UserAccount';
import LoadingScreen from './ChallengeView/LoadingScreen';
import Fetchable from '../../serverApi/Fetchable';
import ChallengeState from '../../../../common/models/ChallengeState';

interface Props {
	challengeState: Fetchable<ChallengeState>,
	onStartChallenge: () => void,
	user: UserAccount
}
export default class extends React.PureComponent<Props> {
	public render() {
		let menuScreen: React.ReactNode | null = null;
		if (this.props.challengeState.isLoading) {
			menuScreen = (
				<LoadingScreen />
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
					onEnroll={this.props.onStartChallenge}
				/>
			);
		}
		return (
			<div className="challenge-view">
				<GameScene
					score={this.props.challengeState.value ? this.props.challengeState.value.score : null}
					timeZoneName={this.props.user ? this.props.user.timeZoneName : null}
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