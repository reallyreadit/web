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
import { ProfileScreen, Deps as SharedProfileScreenDeps, getPathParams } from '../screens/ProfileScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState } from '../Root';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserNameQuery from '../../../../common/models/social/UserNameQuery';
import Profile from '../../../../common/models/social/Profile';
import Fetchable from '../../../../common/Fetchable';
import { formatFetchable } from '../../../../common/format';
import { DeviceType } from '../../../../common/DeviceType';
import UserAccount from '../../../../common/models/UserAccount';
import {noop, reloadProfile, updateProfile} from '../AbstractFollowable';
import produce from 'immer';

function createTitle(profile: Fetchable<Profile>, user: UserAccount | null) {
	return formatFetchable(
		profile,
		profile => profile.userName === user?.name ?
			'My Profile' :
				profile.authorProfile ?
					'Writer' :
					'Reader',
		'Loading...',
		'Profile not found'
	);
}

const createNewScreenState = (result: Fetchable<Profile>, user: UserAccount | null) => produce(
	(currentState: Screen<Fetchable<Profile>>) => {
		currentState.componentState = result;
		currentState.title = createTitle(result, user);
	}
);

export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<SharedProfileScreenDeps, Exclude<keyof SharedProfileScreenDeps, 'deviceType' | 'location' | 'onBeginOnboarding' | 'onCopyAppReferrerTextToClipboard' | 'onOpenNewPlatformNotificationRequestDialog' | 'onReloadProfile' | 'onUpdateProfile' | 'profile' | 'screenId' >> & {
		onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
		onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void
	}
) {
	const factoryHelperDeps = {
		...deps,
		createNewScreenState: createNewScreenState
	}
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const profile = deps.onGetProfile(
				{
					userName: getPathParams(location).userName
				},
				result => {
					deps.onSetScreenState(id, createNewScreenState(result, sharedState.user));
				}
			);
			return {
				id,
				componentState: profile,
				key,
				location,
				title: createTitle(profile, sharedState.user)
			}
		},
		render: (state: Screen, sharedState: SharedState) => {
			const pathParams = getPathParams(state.location);
			return (
				<ProfileScreen {
					...{
						...deps,
						...pathParams,
						deviceType: DeviceType.Ios,
						location: state.location,
						onBeginOnboarding: noop,
						onCopyAppReferrerTextToClipboard: noop,
						onOpenNewPlatformNotificationRequestDialog: noop,
						onReloadProfile: reloadProfile.bind(null, factoryHelperDeps),
						onUpdateProfile: updateProfile.bind(null, factoryHelperDeps),
						profile: state.componentState,
						screenId: state.id,
						userAccount: sharedState.user
					}
				} />
			);
		}
	};
}