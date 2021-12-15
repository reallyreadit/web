import * as React from "react";
import AsyncTracker from "../../../common/AsyncTracker";
import Fetchable from "../../../common/Fetchable";
import {formatCountable } from "../../../common/format";
import { Screen } from '../../common/components/Root';
import Alert from "../../../common/models/notifications/Alert";
import Following from "../../../common/models/social/Following";
import Profile from "../../../common/models/social/Profile";
import UserNameForm from "../../../common/models/social/UserNameForm";
import UserNameQuery from "../../../common/models/social/UserNameQuery";
import UserAccount from "../../../common/models/UserAccount";
import {ShareChannelData} from "../../../common/sharing/ShareData";
import {ShareEvent} from "../../../common/sharing/ShareEvent";
import ShareResponse from "../../../common/sharing/ShareResponse";
import {FetchFunction, FetchFunctionWithParams} from "../serverApi/ServerApi";
import FollowingListDialog from "./FollowingListDialog";
import GetFollowersDialog from "./screens/ProfileScreen/GetFollowersDialog";
import produce from "immer";
import FolloweeCountChange from "../../../common/models/social/FolloweeCountChange";

type AbstractProps = {
	onClearAlerts: (alert: Alert) => void,
	onCloseDialog: () => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onFollowUser: (form: UserNameForm) => Promise<void>,
	onGetFollowees: FetchFunction<Following[]>,
	onGetFollowers: FetchFunctionWithParams<UserNameQuery, Following[]>,
	onOpenDialog: (dialog: React.ReactNode) => void,
	onRegisterFolloweeCountChangedHandler: (handler: (change: FolloweeCountChange) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onUnfollowUser: (form: UserNameForm) => Promise<void>,
	onUpdateProfile: (screenId: number, newValues: Partial<Profile>) => void,
	onViewProfile: (userName: string) => void,
	onReloadProfile: (screenId: number, userName: string, user: UserAccount | null) => Promise<Profile>,
	profile: Fetchable<Profile>,
	screenId: number,
	/** account of currently logged-in user */
	userAccount: UserAccount | null,
	/** username of the user whose profile should be shown */
	userName: string
}

type AbstractState = {}

/**
 * Superclass to share code for classes that allow following and unfollowing of user
*/
export default abstract class AbstractFollowable<Props extends AbstractProps, State extends AbstractState> extends React.Component<Props, State> {
	protected readonly _asyncTracker = new AsyncTracker();

	protected readonly _openGetFollowersDialog = () => {
		this.props.onOpenDialog(
			<GetFollowersDialog
				onCloseDialog={this.props.onCloseDialog}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onShare={this.props.onShare}
				onShareViaChannel={this.props.onShareViaChannel}
				userName={this.props.userAccount.name}
			/>
		);
	};

	protected readonly _showFollowees = () => {
		this.props.onOpenDialog(
			<FollowingListDialog
				onClearAlerts={this.props.onClearAlerts}
				onCloseDialog={this.props.onCloseDialog}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onFollowUser={this._followUser}
				onGetFollowings={this.props.onGetFollowees}
				onUnfollowUser={this._unfollowUser}
				onViewProfile={this.props.onViewProfile}
				title="Following"
				userAccount={this.props.userAccount}
			/>
		);
	};

	protected readonly _showFollowers = () => {
		const isOwnProfile = this.isOwnProfile();
		this.props.onOpenDialog(
			<FollowingListDialog
				clearFollowersAlerts={isOwnProfile}
				onClearAlerts={this.props.onClearAlerts}
				onCloseDialog={this.props.onCloseDialog}
				onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
				onFollowUser={this._followUser}
				onGetFollowings={
					(callback: (value: Fetchable<Following[]>) => void) => this.props.onGetFollowers({ userName: this.props.userName }, callback)
				}
				onUnfollowUser={this._unfollowUser}
				onViewProfile={this.props.onViewProfile}
				title={
					isOwnProfile ?
						"Followers" :
						`Following ${this.props.userName}`
				}
				userAccount={this.props.userAccount}
			/>
		);
	};

	protected readonly _followUser = (form: UserNameForm) => {
		return this.props
			.onFollowUser(form)
			.then(
				() => {
					if (form.userName === this.props.userName) {
						this.setIsFollowed();
					}
				}
			);
	};

	protected readonly _unfollowUser = (form: UserNameForm) => {
		return this.props
			.onUnfollowUser(form)
			.then(
				() => {
					if (form.userName === this.props.userName) {
						this.props.onUpdateProfile(
							this.props.screenId,
							{
								isFollowed: false,
								followerCount: this.props.profile.value.followerCount - 1
							}
						);
					}
				}
			);
	};

	protected isOwnProfile() {
		return this.props.userAccount && this.props.userAccount.name === this.props.userName;
	}

	protected setIsFollowed() {
		this.props.onUpdateProfile(
			this.props.screenId,
			{
				isFollowed: true,
				followerCount: this.props.profile.value.followerCount + 1
			}
		);
	}

	protected _getFollowersText() {
		return this.props.profile.value.followerCount + ' ' + formatCountable(this.props.profile.value.followerCount, 'follower');
	}

	protected _getFolloweesText() {
		return `Following ${this.props.profile.value.followeeCount}`;
	}

	constructor(props: Props) {
		super(props);

		/*
		 * When might this followee count observer be used? For example:
		 * 1. Visit My Profile, which has 5 followees. (in the case of the ProfileScreen instance of AbstractFollwable)
		 * 2. Open the followee dialog
		 * 3. Visit followee profile A (new screen is added)
		 * 4. Unfollow profile A
		 * 5. Now move a screen back to My Profile.
		 * You'd have expected your followee count to decrement by 1, this handler does just that update.
		 *	Note: when going back from the screen of 3. to the screen of 1., the dialog opened in 2. will be closed
			*	(so you need to reopen = reload its contents) */
		this._asyncTracker.addCancellationDelegate(
			this.props.onRegisterFolloweeCountChangedHandler(
				change => {
					if (this.props.profile.value && this.isOwnProfile()) {
						this.props.onUpdateProfile(
							this.props.screenId,
							{
								followeeCount: Math.max(
									this.props.profile.value.followeeCount + (
										change === FolloweeCountChange.Increment ?
											1 :
											-1
									),
									0
								)
							}
						);
					}
				}
			)
		);
	}

	protected _profileUserChangedOrUserChanged(prevProps: Props) {
		return (
			this.props.userName !== prevProps.userName ||
			(
				this.props.userAccount ?
					!prevProps.userAccount || prevProps.userAccount.id !== this.props.userAccount.id :
					!!prevProps.userAccount
			)
		);
	}

	public componentDidUpdate(prevProps: Props) {
		// reload the profile if the profile user has changed or the user has signed in or out
		if (this._profileUserChangedOrUserChanged(prevProps)) {
			this.props.onReloadProfile(this.props.screenId, this.props.userName, this.props.userAccount);
		}
	}
}

// helper methods for factories of AbstractFollowable screen-subclasses

export const noop = () => { }
interface Deps {
	onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
	onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void,
	createNewScreenState: (result: Fetchable<Profile>, user: UserAccount | null) => ((currentState: Readonly<Screen>) => Partial<Screen>)
}

export const reloadProfile = (deps: Deps, screenId: number, userName: string, user: UserAccount | null) => {
			deps.onSetScreenState(
				screenId,
				deps.createNewScreenState(
					{
						isLoading: true
					},
					user
				)
			);
			return new Promise<Profile>(
				(resolve, reject) => {
					deps.onGetProfile(
						{ userName },
						result => {
							deps.onSetScreenState(screenId, deps.createNewScreenState(result, user));
							if (result.value) {
								resolve(result.value);
							} else {
								reject(result.errors);
							}
						}
					);
				}
			);
		};

export const updateProfile = (deps: Deps, screenId: number, newValues: Partial<Profile>) => {
			deps.onSetScreenState(
				screenId,
				produce(
					(currentState: Screen<Fetchable<Profile>>) => {
						currentState.componentState.value = {
							...currentState.componentState.value,
							...newValues
						};
					}
				)
			)
		};