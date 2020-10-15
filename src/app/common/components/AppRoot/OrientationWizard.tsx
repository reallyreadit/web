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
import ImportStep from './OrientationWizard/ImportStep';

interface Props {
	onComplete: () => void,
	onCreateAbsoluteUrl: (userName: string) => string,
	onRequestNotificationAuthorization: () => Promise<NotificationAuthorizationRequestResult>,
	onShare: (data: ShareData) => Promise<ShareResult>,
	user: UserAccount
}
enum Step {
	Tracking,
	Import,
	Notifications,
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
	private readonly _continue = () => {
		this.advance();
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'orientation-wizard_3wn522-fade-out') {
			this.props.onComplete();
		}
	};
	private readonly _handleContainerAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'orientation-wizard_3wn522-fade-out') {
			event.stopPropagation();
			let nextStep: Step | null;
			switch (this.state.step) {
				case Step.Tracking:
					nextStep = Step.Import;
					break;
				case Step.Import:
					nextStep = Step.Notifications;
					break;
				case Step.Notifications:
					nextStep = Step.Share;
					break;
				case Step.Share:
					nextStep = null;
					break;
			}
			if (nextStep != null) {
				this.setState({
					isAdvancingStep: false,
					step: nextStep
				});
			} else {
				this.setState({
					isClosing: true
				});
			}
		}
	};
	private readonly _handleShareCompletion = (result?: ShareResult) => {
		if (result) {
			if (
				!result.completed ||
				result.activityType === 'it.reallyread.mobile.share-extension'
			) {
				// ignore a cancelled activity or a share to our own extension
				return;
			}
		}
		this.advance();
	};
	private readonly _requestNotificationAuthorization = () => {
		this.props
			.onRequestNotificationAuthorization()
			.then(this._continue)
			.catch(this._continue);
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
	private readonly _skipShare = () => {
		this._handleShareCompletion();
	};
	private readonly _stepMap = {
		[Step.Tracking]: (
			<TrackingStep
				onContinue={this._continue}
				onSkip={this._continue}
			/>
		),
		[Step.Import]: (
			<ImportStep
				onContinue={this._continue}
			/>
		),
		[Step.Notifications]: (
			<NotificationsStep
				onRequestAuthorization={this._requestNotificationAuthorization}
				onSkip={this._continue}
			/>
		),
		[Step.Share]: (
			<ShareStep
				onShare={this._share}
				onSkip={this._skipShare}
			/>
		)
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isAdvancingStep: false,
			isClosing: false,
			step: Step.Tracking
		};
	}
	private advance() {
		this.setState({
			isAdvancingStep: true
		});
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