import * as React from 'react';
import TrackingStep from './OrientationWizard/TrackingStep';
import * as classNames from 'classnames';
import NotificationsStep from './OrientationWizard/NotificationsStep';
import NotificationAuthorizationRequestResult from '../../../../common/models/app/NotificationAuthorizationRequestResult';
import ShareData from '../../../../common/sharing/ShareData';
import UserAccount from '../../../../common/models/UserAccount';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import ShareStep from './OrientationWizard/ShareStep';
import ShareResult from '../../../../common/models/app/ShareResult';
import OrientationAnalytics from '../../../../common/models/analytics/OrientationAnalytics';

interface Props {
	onComplete: (analytics: OrientationAnalytics) => void,
	onCreateAbsoluteUrl: (userName: string) => string,
	onRequestNotificationAuthorization: () => Promise<NotificationAuthorizationRequestResult>,
	onShare: (data: ShareData) => Promise<ShareResult>,
	user: UserAccount
}
enum Step {
	Notifications,
	Tracking,
	Share
}
export default class OrientationWizard extends React.PureComponent<
	Props,
	{
		isAdvancingStep: boolean,
		isClosing: boolean,
		step: Step
	}
> {
	private readonly _analytics: OrientationAnalytics;
	private readonly _continueFromTracking = () => {
		this.advance();
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'orientation-wizard_3wn522-fade-out') {
			this.props.onComplete(this._analytics);
		}
	};
	private readonly _handleContainerAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'orientation-wizard_3wn522-fade-out') {
			event.stopPropagation();
			const stepDuration = this.getStepDuration();
			let nextStep: Step | null;
			switch (this.state.step) {
				case Step.Tracking:
					this._analytics.trackingDuration = stepDuration;
					nextStep = Step.Notifications;
					break;
				case Step.Notifications:
					this._analytics.notificationsDuration = stepDuration;
					nextStep = Step.Share;
					break;
				case Step.Share:
					this._analytics.shareDuration = stepDuration;
					nextStep = null;
					break;
			}
			if (nextStep != null) {
				this.setState({
					isAdvancingStep: false,
					step: nextStep
				});
				this._stepStart = this.now();
			} else {
				this.setState({
					isClosing: true
				});
			}
		}
	};
	private readonly _handleNotificationAuthorizationRequestCompletion = (result?: NotificationAuthorizationRequestResult) => {
		if (result) {
			// TODO: show dialog here if previously denied pointing to settings app
			this._analytics.notificationsResult = result;
		}
		this.advance();
	};
	private readonly _handleShareCompletion = (result?: ShareResult) => {
		if (result) {
			if (result.activityType === 'it.reallyread.mobile.share-extension') {
				// ignore a share to our own extension
				return;
			}
			this._analytics.shareResultId = result.id;
		}
		this.advance();
	};
	private readonly _logTrackingPlay = () => {
		this._analytics.trackingPlayCount++;
	};
	private readonly _requestNotificationAuthorization = () => {
		this.props
			.onRequestNotificationAuthorization()
			.then(this._handleNotificationAuthorizationRequestCompletion)
			.catch(this._handleNotificationAuthorizationRequestCompletion);
	};
	private readonly _share = () => {
		const
			url = this.props.onCreateAbsoluteUrl(
				findRouteByKey(routes, ScreenKey.Profile)
					.createUrl({ userName: this.props.user.name })
			),
			text = 'I\'m reading on Readup! Follow me to see what I\'m reading.';
		this.props
			.onShare({
				action: 'OrientationShare',
				email: {
					body: text + '\n\n' + url,
					subject: 'Follow me on Readup'
				},
				text,
				url
			})
			.then(this._handleShareCompletion)
			.catch(this._handleShareCompletion);
	};
	private readonly _skipNotifications = () => {
		this._analytics.notificationsSkipped = true;
		this.advance();
	};
	private readonly _skipShare = () => {
		this._analytics.shareSkipped = true;
		this._handleShareCompletion();
	};
	private readonly _skipTracking = () => {
		this._analytics.trackingSkipped = true;
		this.advance();
	};
	private readonly _stepMap = {
		[Step.Notifications]: (
			<NotificationsStep
				onRequestAuthorization={this._requestNotificationAuthorization}
				onSkip={this._skipNotifications}
			/>
		),
		[Step.Tracking]: (
			<TrackingStep
				onContinue={this._continueFromTracking}
				onPlay={this._logTrackingPlay}
				onSkip={this._skipTracking}
			/>
		),
		[Step.Share]: (
			<ShareStep
				onShare={this._share}
				onSkip={this._skipShare}
			/>
		)
	};
	private _stepStart = this.now();
	constructor(props: Props) {
		super(props);
		this.state = {
			isAdvancingStep: false,
			isClosing: false,
			step: Step.Tracking
		};
		this._analytics = {
			trackingPlayCount: 0,
			trackingSkipped: false,
			trackingDuration: 0,
			importPlayCount: 0,
			importSkipped: false,
			importDuration: 0,
			notificationsResult: NotificationAuthorizationRequestResult.None,
			notificationsSkipped: false,
			notificationsDuration: 0,
			shareResultId: null,
			shareSkipped: false,
			shareDuration: 0
		};
	}
	private advance() {
		this.setState({
			isAdvancingStep: true
		});
	}
	private getStepDuration() {
		return Math.floor(this.now() - this._stepStart);
	}
	private now() {
		return Date.now() / 1000;
	}
	public render() {
		return (
			<div
				className={classNames('orientation-wizard_3wn522', { 'closing': this.state.isClosing })}
				onAnimationEnd={this._handleAnimationEnd}
			>
				<div
					className={
						classNames(
							'container',
							{
								'advancing': this.state.isAdvancingStep,
								'advanced': !this.state.isAdvancingStep && this.state.step !== Step.Tracking,
								'initial': !this.state.isAdvancingStep && this.state.step === Step.Tracking
							}
						)
					}
					onAnimationEnd={this._handleContainerAnimationEnd}
				>
					{this._stepMap[this.state.step]}
				</div>
			</div>
		);
	}
}