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
import NotificationPreference from '../../../../common/models/notifications/NotificationPreference';
import AlertSelector, {
	Value as SelectorValue,
} from './NotificationPreferencesControl/AlertSelector';
import AlertPreference from '../../../../common/models/notifications/AlertPreference';
import AlertEmailPreference from '../../../../common/models/notifications/AlertEmailPreference';

interface Props {
	preference: NotificationPreference;
	onChangeNotificationPreference: (
		data: NotificationPreference
	) => Promise<any>;
}
interface State extends NotificationPreference {
	isCompanyUpdateEnabled: boolean;
	isAotdEnabled: boolean;
	isPostEnabled: boolean;
	isReplyEnabled: boolean;
	isLoopbackEnabled: boolean;
	isFollowerEnabled: boolean;
}
function isEnabled(preference: AlertPreference) {
	return (
		preference.email !== AlertEmailPreference.None ||
		preference.push
	);
}
function coalesce<T>(a: T | null, b: T) {
	return a != null ? a : b;
}
function merge(partial: Partial<SelectorValue>, preference: AlertPreference) {
	return {
		email: coalesce(partial.email, preference.email),
		extension: preference.extension,
		push: coalesce(partial.push, preference.push),
	};
}
function mapToState(preference: NotificationPreference) {
	return {
		...preference,
		isCompanyUpdateEnabled: preference.companyUpdate,
		isAotdEnabled: isEnabled(preference.aotd),
		isPostEnabled: isEnabled(preference.post),
		isReplyEnabled: isEnabled(preference.reply),
		isLoopbackEnabled: isEnabled(preference.loopback),
		isFollowerEnabled: isEnabled(preference.follower),
	};
}
export default class NotificationPreferencesControl extends React.Component<
	Props,
	State
> {
	private readonly _changeCompanyUpdate = (value: Partial<SelectorValue>) => {
		return this.saveChanges({
			isCompanyUpdateEnabled: value.isEnabled,
			companyUpdate: value.isEnabled,
		});
	};
	private readonly _changeAotd = (value: Partial<SelectorValue>) => {
		const preference = merge(value, this.state.aotd);
		return this.saveChanges({
			isAotdEnabled: isEnabled(preference),
			aotd: preference,
		});
	};
	private readonly _changePost = (value: Partial<SelectorValue>) => {
		const preference = merge(value, this.state.post);
		return this.saveChanges({
			isPostEnabled: isEnabled(preference),
			post: preference,
		});
	};
	private readonly _changeReply = (value: Partial<SelectorValue>) => {
		const preference = merge(value, this.state.reply);
		return this.saveChanges({
			isReplyEnabled: isEnabled(preference),
			reply: preference,
		});
	};
	private readonly _changeLoopback = (value: Partial<SelectorValue>) => {
		const preference = merge(value, this.state.loopback);
		return this.saveChanges({
			isLoopbackEnabled: isEnabled(preference),
			loopback: preference,
		});
	};
	private readonly _changeFollower = (value: Partial<SelectorValue>) => {
		const preference = merge(value, this.state.follower);
		return this.saveChanges({
			isFollowerEnabled: isEnabled(preference),
			follower: preference,
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = mapToState(props.preference);
	}
	private saveChanges(state: Partial<State>) {
		const nextState = {
			...this.state,
			...state,
		};
		this.setState(state as State);
		return this.props.onChangeNotificationPreference({
			companyUpdate: nextState.companyUpdate,
			aotd: nextState.aotd,
			post: nextState.post,
			reply: nextState.reply,
			loopback: nextState.loopback,
			follower: nextState.follower,
		});
	}
	public render() {
		return (
			<div className="notification-preferences-control_m5xqhx">
				<div>
					Digest emails are sent at 6 AM EST. Weekly digests go out on Tuesday.
				</div>
				<AlertSelector
					title="Product updates"
					subtitle="The inside scoop on Readup."
					showChannels={false}
					onChange={this._changeCompanyUpdate}
					isEnabled={this.state.isCompanyUpdateEnabled}
				/>
				<AlertSelector
					title="Article of the Day"
					subtitle="(Recommended)"
					emailOptions={
						AlertEmailPreference.Immediately | AlertEmailPreference.WeeklyDigest
					}
					onChange={this._changeAotd}
					isEnabled={this.state.isAotdEnabled}
					email={this.state.aotd.email}
					push={this.state.aotd.push}
				/>
				<AlertSelector
					title="Posts from people I follow"
					onChange={this._changePost}
					isEnabled={this.state.isPostEnabled}
					email={this.state.post.email}
					push={this.state.post.push}
				/>
				<AlertSelector
					title="Replies to my comments"
					onChange={this._changeReply}
					isEnabled={this.state.isReplyEnabled}
					email={this.state.reply.email}
					push={this.state.reply.push}
				/>
				<AlertSelector
					title="Comments on articles I've read"
					onChange={this._changeLoopback}
					isEnabled={this.state.isLoopbackEnabled}
					email={this.state.loopback.email}
					push={this.state.loopback.push}
				/>
				<AlertSelector
					title="New followers"
					onChange={this._changeFollower}
					isEnabled={this.state.isFollowerEnabled}
					email={this.state.follower.email}
					push={this.state.follower.push}
				/>
			</div>
		);
	}
}
