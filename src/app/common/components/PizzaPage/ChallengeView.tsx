import * as React from 'react';
import Context, { contextTypes } from '../../Context';
import ChallengeResponseAction from '../../../../common/models/ChallengeResponseAction';
import EnrollmentPromptScreen from './ChallengeView/EnrollmentPromptScreen';
import EnrollScreen from './ChallengeView/EnrollScreen';
import GameScene from './ChallengeView/GameScene';
import UserArticle from '../../../../common/models/UserArticle';
import UserAccount from '../../../../common/models/UserAccount';
import EventType from '../../EventType';
import LoadingScreen from './ChallengeView/LoadingScreen';

enum Screen {
	Loading,
	Enroll
}
export default class extends React.Component<
	{},
	{
		screen: Screen | null
	}
> {
	public static contextTypes = contextTypes;
	public context: Context;
	private readonly _reset = () => {
		if (this.state.screen !== null) {
			this.setState({ screen: null });
		} else {
			this.forceUpdate();
		}
	};
	private readonly _handleSignIn = (event: { eventType: EventType }) => {
		this.setState({ screen: Screen.Loading });
		if (event.eventType === EventType.Original) {
			this.context.api.getChallengeState(state => {
				this.setState({ screen: null });
				this.context.challenge.update(state.value);
			});
		}
	};
	private readonly _handleSignOut = () => {
		this.setState({ screen: null });
		this.context.challenge.update({
			latestResponse: null,
			score: null
		});
	};
	private readonly _handleUserChange = (ev: {
		prevUserAccount: UserAccount,
		currUserAccount: UserAccount,
		eventType: EventType
	}) => {
		if (ev.prevUserAccount.isEmailConfirmed !== ev.currUserAccount.isEmailConfirmed) {
			this.forceUpdate();
		}
	};
	private readonly _goToEnrollScreen = () => {
		this.setState({ screen: Screen.Enroll });
	};
	private readonly _handleArticleUpdate = (data: { article: UserArticle, isCompletionCommit: boolean }) => {
		if (data.isCompletionCommit) {
			this.context.api.getChallengeScore(
				this.context.challenge.activeChallenge.id,
				score => {
					this.context.challenge.update({ score: score.value });
				}
			);
		}
	};
	constructor(props: {}, context: Context) {
		super(props, context);
		this.state = {
			screen: null
		};
	}
	public componentDidMount() {
		this.context.user
			.addListener('signIn', this._handleSignIn)
			.addListener('signOut', this._handleSignOut)
			.addListener('update', this._handleUserChange);
		this.context.challenge.addListener('change', this._reset);
		this.context.environment.addListener('articleUpdated', this._handleArticleUpdate);
	}
	public componentWillUnmount() {
		this.context.user
			.removeListener('signIn', this._handleSignIn)
			.removeListener('signOut', this._handleSignOut)
			.removeListener('update', this._handleUserChange);
		this.context.challenge.removeListener('change', this._reset);
		this.context.environment.removeListener('articleUpdated', this._handleArticleUpdate);
	}
	public render() {
		if (
			this.context.challenge.activeChallenge && (
				!this.context.challenge.latestResponse ||
				this.context.challenge.latestResponse.action === ChallengeResponseAction.Enroll
			)
		) {
			let
				menuScreen: React.ReactNode | null = null,
				timeZoneName: string | null = null;
			if (this.state.screen === Screen.Loading) {
				menuScreen = (
					<LoadingScreen />
				);
			} else if (!this.context.challenge.latestResponse) {
				if (this.state.screen === Screen.Enroll) {
					menuScreen = (
						<EnrollScreen
							onCancel={this._reset}
						/>
					);
				} else {
					menuScreen = (
						<EnrollmentPromptScreen
							isUserSignedIn={this.context.user.isSignedIn}
							isUserEmailConfirmed={
								this.context.user.isSignedIn ?
									this.context.user.userAccount.isEmailConfirmed :
									false
							}
							onEnroll={this._goToEnrollScreen}
						/>
					);
				}
			}
			if (this.context.challenge.latestResponse) {
				timeZoneName = this.context.challenge.latestResponse.timeZoneName;
			}
			return (
				<div className="challenge-view">
					<GameScene
						score={this.context.challenge.score}
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
		return null;
	}
}