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
import classNames from 'classnames';

interface Props {
	count: number
}
interface State {
	visibility: 'visible' | 'hiding' | 'hidden'
}
export default class AlertBadge extends React.PureComponent<Props, State> {
	private readonly _handleAnimationEnd = (event: React.AnimationEvent<HTMLSpanElement>) => {
		if (event.animationName === 'alert-badge_ejzklr-scale-down') {
			this.setState({
				visibility: 'hidden'
			});
		}
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			visibility: props.count ?
				'visible' :
				'hidden'
		};
	}
	public componentDidUpdate(prevProps: Props) {
		if (this.props.count && !prevProps.count) {
			this.setState({
				visibility: 'visible'
			});
		} else if (!this.props.count && prevProps.count) {
			this.setState({
				visibility: 'hiding'
			});
		}
	}
	public render() {
		return (
			<span
				className={
					classNames('alert-badge_ejzklr', this.state.visibility)
				}
				onAnimationEnd={this._handleAnimationEnd}
			>
				{this.props.count}
			</span>
		);
	}
}