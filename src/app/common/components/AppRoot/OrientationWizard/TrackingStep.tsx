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
import TrackingAnimation from '../../Animations/Tracking/TrackingAnimation';
import Button from '../../../../../common/components/Button';
import Link from '../../../../../common/components/Link';
import * as classNames from 'classnames';

interface Props {
	onContinue: () => void;
	onPlay?: () => void;
	onSkip: () => void;
}
enum ControlState {
	Skip,
	HidingSkip,
	Continue,
}
export default class TrackingStep extends React.PureComponent<
	Props,
	{
		controlState: ControlState;
	}
> {
	private readonly _hideSkipControl = () => {
		this.setState({
			controlState: ControlState.HidingSkip,
		});
	};
	private readonly _showContinueControl = (event: React.AnimationEvent) => {
		if (event.animationName === 'tracking-step_444uyc-fade-out') {
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
			<div className="tracking-step_444uyc">
				<h1>Welcome!</h1>
				<TrackingAnimation
					onFinished={this._hideSkipControl}
					onPlay={this.props.onPlay}
				/>
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
							onClick={this.props.onSkip}
							text="Skip"
						/>
					)}
				</div>
			</div>
		);
	}
}
