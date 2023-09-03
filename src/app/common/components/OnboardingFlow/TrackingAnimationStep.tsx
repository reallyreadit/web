// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import TrackingAnimation from '../Animations/Tracking/TrackingAnimation';
import Button from '../../../../common/components/Button';
import Link from '../../../../common/components/Link';
import * as classNames from 'classnames';

interface Props {
	onContinue: () => void;
}
enum ControlState {
	Skip,
	HidingSkip,
	Continue,
}
interface State {
	controlState: ControlState;
}
export default class TrackingStep extends React.PureComponent<Props, State> {
	private readonly _hideSkipControl = () => {
		this.setState({
			controlState: ControlState.HidingSkip,
		});
	};
	private readonly _showContinueControl = (event: React.AnimationEvent) => {
		if (event.animationName === 'tracking-animation-step_dkomcd-fade-out') {
			this.setState({
				controlState: ControlState.Continue,
			});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			controlState: ControlState.Skip,
		};
	}
	public render() {
		return (
			<div className="tracking-animation-step_dkomcd">
				<TrackingAnimation onFinished={this._hideSkipControl} />
				<div className="controls">
					{this.state.controlState === ControlState.Continue ? (
						<Button
							className="continue"
							intent="loud"
							onClick={this.props.onContinue}
							size="large"
							text="Continue"
						/>
					) : (
						<Link
							onAnimationEnd={this._showContinueControl}
							className={classNames('skip', {
								hidden: this.state.controlState === ControlState.HidingSkip,
							})}
							onClick={this.props.onContinue}
							text="Skip"
						/>
					)}
				</div>
			</div>
		);
	}
}
