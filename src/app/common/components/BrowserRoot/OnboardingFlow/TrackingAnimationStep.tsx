import * as React from 'react';
import TrackingAnimation from '../../Animations/Tracking/TrackingAnimation';
import Button from '../../../../../common/components/Button';
import ActionLink from '../../../../../common/components/ActionLink';
import * as classNames from 'classnames';

interface Props {
	onContinue: () => void
}
enum ControlState {
	Skip,
	HidingSkip,
	Continue
}
interface State {
	controlState: ControlState
}
export default class TrackingStep extends React.PureComponent<Props, State> {
	private readonly _hideSkipControl = () => {
		this.setState({
			controlState: ControlState.HidingSkip
		});
	};
	private readonly _showContinueControl = (event: React.AnimationEvent) => {
		if (event.animationName === 'tracking-animation-step_dkomcd-fade-out') {
			this.setState({
				controlState: ControlState.Continue
			});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			controlState: ControlState.Skip
		};
	}
	public render() {
		return (
			<div className="tracking-animation-step_dkomcd">
				<TrackingAnimation
					onFinished={this._hideSkipControl}
				/>
				<div className="controls">
					{this.state.controlState === ControlState.Continue ?
						<Button
							className="continue"
							intent="loud"
							onClick={this.props.onContinue}
							size="large"
							text="Continue"
						/> :
						<ActionLink
							onAnimationEnd={this._showContinueControl}
							className={classNames('skip', { 'hidden': this.state.controlState === ControlState.HidingSkip })}
							onClick={this.props.onContinue}
							text="Skip"
						/>}
				</div>
			</div>
		);
	}
}