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
import Button, { ButtonSize } from './Button';
import Following from '../models/social/Following';
import UserNameForm from '../models/social/UserNameForm';

interface Props {
	following: Following;
	isBusy?: boolean;
	onFollow: (form: UserNameForm) => Promise<void>;
	onUnfollow: (form: UserNameForm) => Promise<void>;
	size?: ButtonSize;
}
interface State {
	isBusy: boolean;
	isHovering: boolean;
}
export default class FollowButton extends React.PureComponent<Props, State> {
	private readonly _follow = () => {
		this.setState({ isBusy: true });
		this.props.onFollow(this.props.following).then(() => {
			this.setState({
				isBusy: false,
				isHovering: false,
			});
		});
	};
	private readonly _startHovering = () => {
		this.setState({ isHovering: true });
	};
	private readonly _stopHovering = () => {
		this.setState({ isHovering: false });
	};
	private readonly _unfollow = () => {
		this.setState({ isBusy: true });
		this.props.onUnfollow(this.props.following).then(() => {
			this.setState({ isBusy: false });
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isBusy: false,
			isHovering: false,
		};
	}
	public render() {
		const isBusy = this.state.isBusy || this.props.isBusy;
		return (
			<Button
				className='follow-button_bz2yn'
				text={
					this.props.following.isFollowed
						? this.state.isHovering
							? 'Unfollow'
							: 'Following'
						: 'Follow'
				}
				state={isBusy ? 'busy' : 'normal'}
				size={this.props.size}
				intent={
					this.props.following.isFollowed
						? this.state.isHovering && !isBusy
							? 'warning'
							: 'default'
						: 'loud'
				}
				onClick={
					this.props.following.isFollowed ? this._unfollow : this._follow
				}
				onMouseEnter={this._startHovering}
				onMouseLeave={this._stopHovering}
			/>
		);
	}
}
