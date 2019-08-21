import * as React from 'react';
import Dialog from '../../controls/Dialog';
import { FetchFunction } from '../../../serverApi/ServerApi';
import Following from '../../../../../common/models/social/Following';
import Fetchable from '../../../../../common/Fetchable';
import AsyncTracker from '../../../../../common/AsyncTracker';
import LoadingOverlay from '../../controls/LoadingOverlay';
import UserNameForm from '../../../../../common/models/social/UserNameForm';
import FollowButton from '../../../../../common/components/FollowButton';
import UserAccount from '../../../../../common/models/UserAccount';

interface Props {
	onCloseDialog: () => void,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowings: FetchFunction<Following[]>,
	onUnfollowUser: (form: UserNameForm) => Promise<void>,
	title: string,
	userAccount: UserAccount | null,
}
interface State {
	followings: Fetchable<Following[]>
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
	constructor(props: Props) {
		super(props);
		this.state = {
			followings: props.onGetFollowings(
				this._asyncTracker.addCallback(
					followings => {
						this.setState({ followings });
					}
				)
			)
		};
	}
	public render() {
		return (
			<Dialog
				className="following-list-dialog_sscllo"
				onClose={this.props.onCloseDialog}
				title={this.props.title}
			>
				{this.state.followings.isLoading ?
					<LoadingOverlay position="static" /> :
					<ol className="followings">
						{this.state.followings.value.map(
							following => (
								<li
									className="following"
									key={following.userName}
								>
									<span className="user-name">{following.userName}</span>
									{this.props.userAccount && this.props.userAccount.name !== following.userName ?
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
						)}
					</ol>}
			</Dialog>
		);
	}
}