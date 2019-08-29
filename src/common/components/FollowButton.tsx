import * as React from 'react';
import Button, { ButtonSize } from './Button';
import Following from '../models/social/Following';
import UserNameForm from '../models/social/UserNameForm';

interface Props {
	following: Following,
	onFollow: (form: UserNameForm) => Promise<void>,
	onUnfollow: (form: UserNameForm) => Promise<void>,
	size?: ButtonSize
}
interface State {
	isBusy: boolean,
	isHovering: boolean
}
export default class FollowButton extends React.PureComponent<Props, State> {
	private readonly _follow = () => {
		this.setState({ isBusy: true });
		this.props
			.onFollow(this.props.following)
			.then(
				() => {
					this.setState({
						isBusy: false,
						isHovering: false
					});
				}
			);
	};
	private readonly _startHovering = () => {
		this.setState({  isHovering: true });
	};
	private readonly _stopHovering = () => {
		this.setState({ isHovering: false });
	};
	private readonly _unfollow = () => {
		this.setState({ isBusy: true });
		this.props
			.onUnfollow(this.props.following)
			.then(
				() => {
					this.setState({ isBusy: false });
				}
			);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isBusy: false,
			isHovering: false
		};
	}
	public render() {
		return (
			<Button
				className='follow-button_bz2yn'
				text={
					this.props.following.isFollowed ?
						this.state.isHovering ?
							'Unfollow' :
							'Following'
						: 'Follow'
				}
				state={
					this.state.isBusy ?
						'busy' :
						'normal'
				}
				size={this.props.size}
				intent={
					this.props.following.isFollowed ?
						this.state.isHovering && !this.state.isBusy ?
							'warning' :
							'default' :
						'loud'
				}
				onClick={
					this.props.following.isFollowed ?
						this._unfollow :
						this._follow
				}
				onMouseEnter={this._startHovering}
				onMouseLeave={this._stopHovering}
			/>
		);
	}
}