import * as React from 'react';
import Dialog from '../../../common/components/Dialog';
import { FetchFunction } from '../serverApi/ServerApi';
import Following from '../../../common/models/social/Following';
import Fetchable from '../../../common/Fetchable';
import AsyncTracker from '../../../common/AsyncTracker';
import LoadingOverlay from './controls/LoadingOverlay';
import UserNameForm from '../../../common/models/social/UserNameForm';
import FollowButton from '../../../common/components/FollowButton';
import UserAccount from '../../../common/models/UserAccount';
import ProfileLink from '../../../common/components/ProfileLink';
import Alert from '../../../common/models/notifications/Alert';
import Highlighter from '../../../common/components/Highlighter';

interface Props {
	clearFollowersAlerts?: boolean,
	highlightedUser?: string,
	onClearAlerts: (alert: Alert) => void,
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
	private _hasClearedAlerts = false;
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
						this.clearAlertsIfNeeded();
					}
				)
			),
			isClosing: false
		};
	}
	private clearAlertsIfNeeded() {
		if (
			this.props.clearFollowersAlerts &&
			!this._hasClearedAlerts &&
			this.props.userAccount &&
			this.props.userAccount.followerAlertCount
		) {
			this.props.onClearAlerts(Alert.Followers);
			this._hasClearedAlerts = true;
		}
	}
	public componentDidMount() {
		if (!this.state.followings.isLoading) {
			this.clearAlertsIfNeeded();
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<Dialog
				className="following-list-dialog_7vsgrb"
				closeButtonText="Ok"
				isClosing={this.state.isClosing}
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
									{this.props.userAccount && this.props.userAccount.name !== following.userName ?
										<Highlighter
											className="content"
											highlight={
												following.hasAlert ||
												this.props.highlightedUser === following.userName
											}
										>
											<ProfileLink
												className="user-name"
												onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
												onViewProfile={this._viewProfile}
												userName={following.userName}
											/>
											<div className="button">
												<FollowButton
													following={following}
													onFollow={this._followUser}
													onUnfollow={this._unfollowUser}
												/>
											</div>
										</Highlighter> :
										<div className="content">
											<span className="user-name">{following.userName}</span>
										</div>}
								</li>
							)
						)}
					</ol>}
			</Dialog>
		);
	}
}