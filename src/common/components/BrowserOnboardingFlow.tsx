import * as React from 'react';
import UserAccount from '../models/UserAccount';
import * as classNames from 'classnames';
import Icon from '../components/Icon';
import TransitionContainer from './TransitionContainer';

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
	goingToStep: number | null
	step: number
}
export default abstract class BrowserOnboardingFlow<Props extends BaseProps> extends React.Component<Props, State> {
	private readonly _completeStepTransition = () => {
		this.setState({
			goingToStep: null,
			step: this.state.goingToStep
		});
	};
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		if (event.animationName === 'browser-onboarding-flow_74077a-steps-slide-out') {
			this.props.onClose(
				this.state.exitReason != null ?
					this.state.exitReason :
					ExitReason.Aborted
			);
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
					<TransitionContainer
						isTransitioning={this.state.goingToStep != null}
						onTransitionComplete={this._completeStepTransition}
					>
						<div className="content">
							{this.getStepRenderer(this.state.step)(this.props.user)}
						</div>
					</TransitionContainer>
				</div>
			</div>
		);
	}
}