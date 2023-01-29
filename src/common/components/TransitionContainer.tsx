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
import * as classNames from 'classnames';

interface Props {
	children: React.ReactNode;
	isTransitioning: boolean;
	onTransitionComplete: () => void;
}
interface State {
	hasChanged: boolean;
}
export default class TransitionContainer extends React.Component<Props, State> {
	private readonly _handleAnimationEnd = (event: React.AnimationEvent) => {
		event.stopPropagation();
		if (event.animationName === 'transition-container_ko0vbz-fade-out') {
			this.setState(
				{
					hasChanged: true,
				},
				this.props.onTransitionComplete
			);
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			hasChanged: false,
		};
	}
	public render() {
		return (
			<div
				className={classNames('transition-container_ko0vbz', {
					changing: this.props.isTransitioning,
					changed: !this.props.isTransitioning && this.state.hasChanged,
				})}
				onAnimationEnd={this._handleAnimationEnd}
			>
				{this.props.children}
			</div>
		);
	}
}
