import * as React from 'react';
import Dialog from '../../../../../common/components/Dialog';
import { FetchFunction } from '../../../serverApi/ServerApi';
import Following from '../../../../../common/models/social/Following';
import Fetchable from '../../../../../common/Fetchable';
import AsyncTracker from '../../../../../common/AsyncTracker';
import LoadingOverlay from '../../controls/LoadingOverlay';
import UserNameForm from '../../../../../common/models/social/UserNameForm';
import FollowButton from '../../../../../common/components/FollowButton';
import UserAccount from '../../../../../common/models/UserAccount';
import ProfileLink from '../../../../../common/components/ProfileLink';

interface Props {
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowings: FetchFunction<Following[]>,
	onUnfollowUser: (form: UserNameForm) => Promise<void>,
	onViewProfile: (userName: string) => void,
	title: string,
	userAccount: UserAccount | null,
}
interface State {
	followings: Fetchable<Following[]>,
	isClosing: boolean
}
export default class FollowingListDialog extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _followUser = (form: UserNameForm) => {
		return this.props
			.onFollowUser(form)
			.then(
				() => {
					const followings = this.state.followings.value.slice();
					followings.find(following => following.userName === form.userName).isFollowed = true;
					this.setState({
						followings: {
							...this.state.followings,
							value: followings
						}
					});
				}
			);
	};
	private readonly _unfollowUser = (form: UserNameForm) => {
		return this.props
			.onUnfollowUser(form)
			.then(
				() => {
					const followings = this.state.followings.value.slice();
					followings.find(following => following.userName === form.userName).isFollowed = false;
					this.setState({
						followings: {
							...this.state.followings,
							value: followings
						}
					});
				}
			);
	};
	private readonly _viewProfile = (userName: string) => {
		this.props.onViewProfile(userName);
		this.setState({ isClosing: true });
		this.props.onCloseDialog();
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			followings: props.onGetFollowings(
				this._asyncTracker.addCallback(
					followings => {
						this.setState({ followings });
					}
				)
			),
			isClosing: false
		};
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Dialog
				className="following-list-dialog_sscllo"
				closeButtonText="Ok"
				isClosing={this.state.isClosing}
				onClose={this.props.onCloseDialog}
				title={this.props.title}
			>
				{this.state.followings.isLoading ?
					<LoadingOverlay position="static" /> :
					<ol className="followings">
						{this.state.followings.value.map(
							following => {
								const isOwnAccount = (
									this.props.userAccount && this.props.userAccount.name === following.userName
								);
								return (
									<li
										className="following"
										key={following.userName}
									>
										{!isOwnAccount ?
											<ProfileLink
												className="user-name"
												onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
												onViewProfile={this._viewProfile}
												userName={following.userName}
											/> :
											<span className="user-name">{following.userName}</span>}
										{!isOwnAccount ?
											<div className="button">
												<FollowButton
													following={following}
													onFollow={this._followUser}
													onUnfollow={this._unfollowUser}	
												/>
											</div> :
											null}
									</li>
								)
							}
						)}
					</ol>}
			</Dialog>
		);
	}
}