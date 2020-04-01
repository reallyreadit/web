import * as React from 'react';
import { ProfileScreen, Deps, getPathParams } from '../screens/ProfileScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState } from '../Root';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserNameQuery from '../../../../common/models/social/UserNameQuery';
import Profile from '../../../../common/models/social/Profile';
import Fetchable from '../../../../common/Fetchable';
import produce from 'immer';
import { formatFetchable } from '../../../../common/format';
import { DeviceType } from '../../../../common/DeviceType';

export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Deps, Exclude<keyof Deps, 'deviceType' | 'onBeginOnboarding' | 'onCopyAppReferrerTextToClipboard' | 'onOpenNewPlatformNotificationRequestDialog' | 'onReloadProfile' | 'onUpdateProfile' | 'profile' | 'screenId'>> & {
		onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
		onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void
	}
) {
	const
		noop = () => { },
		createScreenUpdater = (result: Fetchable<Profile>) => produce(
			(currentState: Screen<Fetchable<Profile>>) => {
				currentState.componentState = result;
				if (result.value) {
					currentState.title = '@' + result.value.userName;
				} else {
					currentState.title = 'Profile not found';
				}
			}
		),
		reloadProfile = (screenId: number, userName: string) => new Promise<Profile>(
			(resolve, reject) => {
				deps.onGetProfile(
					{ userName },
					result => {
						deps.onSetScreenState(screenId, createScreenUpdater(result));
						if (result.value) {
							resolve(result.value);
						} else {
							reject(result.errors);
						}
					}
				);
			}
		),
		updateProfile = (screenId: number, newValues: Partial<Profile>) => {
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
	return {
		create: (id: number, location: RouteLocation) => {
			const profile = deps.onGetProfile(
				{
					userName: getPathParams(location).userName
				},
				result => {
					deps.onSetScreenState(id, createScreenUpdater(result));
				}
			);
			return {
				id,
				componentState: profile,
				key,
				location,
				title: formatFetchable(
					profile,
					profile => '@' + profile.userName,
					'Loading...',
					'Profile not found'
				)
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
						onBeginOnboarding: noop,
						onCopyAppReferrerTextToClipboard: noop,
						onOpenNewPlatformNotificationRequestDialog: noop,
						onReloadProfile: reloadProfile,
						onUpdateProfile: updateProfile,
						profile: state.componentState,
						screenId: state.id,
						userAccount: sharedState.user
					}
				} />
			);
		}
	};
}