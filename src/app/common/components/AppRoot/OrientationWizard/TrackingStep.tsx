import * as React from 'react';
import TrackingAnimation from '../../Animations/Tracking/TrackingAnimation';
import Button from '../../../../../common/components/Button';
import ActionLink from '../../../../../common/components/ActionLink';
import * as classNames from 'classnames';

interface Props {
	onContinue: () => void,
	onPlay: () => void,
	onSkip: () => void
}
enum ControlState {
	Skip,
	HidingSkip,
	Continue
}
export default class TrackingStep extends React.PureComponent<
	Props,
	{
		controlState: ControlState
	}
> {
	private readonly _hideSkipControl = () => {
		this.setState({
			controlState: ControlState.HidingSkip
		});
	};
	private readonly _showContinueControl = (event: React.AnimationEvent) => {
		if (event.animationName === 'tracking-step_444uyc-fade-out') {
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
			<div className="tracking-step_444uyc">
				<h1>Welcome!</h1>
				<TrackingAnimation
					onFinished={this._hideSkipControl}
					onPlay={this.props.onPlay}
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
							onClick={this.props.onSkip}
							text="Skip"
						/>}
				</div>
			</div>
		);
	}
}