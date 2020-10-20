import * as React from 'react';
import UserAccount from '../models/UserAccount';
import * as classNames from 'classnames';
import Icon from '../components/Icon';

export enum ExitReason {
	Aborted,
	Completed,
	ExistingUserAuthenticated
}
export interface BaseProps {
	onClose: (reason: ExitReason) => void,
	user: UserAccount | null
}
interface State {
	exitReason: ExitReason | null,
	goingToStep: number | null,
	isInitialStep: boolean,
	step: number
}
export default abstract class BrowserOnboardingFlow<Props extends BaseProps> extends React.Component<Props, State> {
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'browser-onboarding-flow_74077a-steps-slide-out') {
			this.props.onClose(
				this.state.exitReason != null ?
					this.state.exitReason :
					ExitReason.Aborted
			);
		}
	};
	private readonly _handleStepAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'browser-onboarding-flow_74077a-container-fade-out') {
			this.setState({
				goingToStep: null,
				isInitialStep: false,
				step: this.state.goingToStep
			});
		}
	};
	protected readonly _abort = () => {
		this._beginClosing(ExitReason.Aborted);
	};
	protected readonly _beginClosing = (exitReason: ExitReason) => {
		this.setState({
			exitReason
		});
	};
	protected readonly _complete = () => {
		this._beginClosing(ExitReason.Completed);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			exitReason: null,
			goingToStep: null,
			isInitialStep: true,
			step: null
		};
	}
	protected abstract getStepRenderer(step: number): (user: UserAccount) => React.ReactNode;
	protected abstract shouldAllowCancellation(): boolean;
	protected goToStep(step: number) {
		this.setState({
			goingToStep: step
		});
	}
	public render() {
		return (
			<div
				className={classNames('browser-onboarding-flow_74077a', { 'closing': this.state.exitReason != null })}
				onAnimationEnd={this._handleAnimationEnd}
			>
				<div className="steps">
					<div className="titlebar">
						<div className="icon-right">
							{this.shouldAllowCancellation() ?
								<Icon
									display="block"
									name="cancel"
									onClick={this._abort}
								/> :
								null}
						</div>
					</div>
					<div
						className={
							classNames(
								'content',
								{
									'changing': this.state.goingToStep != null,
									'changed': this.state.goingToStep == null && !this.state.isInitialStep
								}
							)
						}
						onAnimationEnd={this._handleStepAnimationEnd}
					>
						{this.getStepRenderer(this.state.step)(this.props.user)}
					</div>
				</div>
			</div>
		);
	}
}