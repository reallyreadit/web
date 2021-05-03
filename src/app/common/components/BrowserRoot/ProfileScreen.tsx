import * as React from 'react';
import { ProfileScreen, Deps, getPathParams } from '../screens/ProfileScreen';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen } from '../Root';
import { SharedState } from '../BrowserRoot';
import Profile from '../../../../common/models/social/Profile';
import UserNameQuery from '../../../../common/models/social/UserNameQuery';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import produce from 'immer';
import Fetchable from '../../../../common/Fetchable';
import { formatFetchable } from '../../../../common/format';
import UserAccount from '../../../../common/models/UserAccount';

function createTitle(profile: Fetchable<Profile>, user: UserAccount | null) {
	return formatFetchable(
		profile,
		profile => profile.userName === user?.name ?
			'My Profile' :
			`@${profile.userName} • Readup`,
		'Loading...',
		'Profile not found'
	);
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Deps, Exclude<keyof Deps, 'location' | 'onReloadProfile' | 'onUpdateProfile' | 'profile' | 'screenId'>> & {
		onGetProfile: FetchFunctionWithParams<UserNameQuery, Profile>,
		onSetScreenState: (id: number, getNextState: (currentState: Readonly<Screen>) => Partial<Screen>) => void
	}
) {
	const
		createScreenUpdater = (result: Fetchable<Profile>, user: UserAccount | null) => produce(
			(currentState: Screen<Fetchable<Profile>>) => {
				currentState.componentState = result;
				currentState.title = createTitle(result, user);
			}
		),
		reloadProfile = (screenId: number, userName: string, user: UserAccount | null) => {
			deps.onSetScreenState(
				screenId,
				createScreenUpdater(
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
							deps.onSetScreenState(screenId, createScreenUpdater(result, user));
							if (result.value) {
								resolve(result.value);
							} else {
								reject(result.errors);
							}
						}
					);
				}
			);
		},
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
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const profile = deps.onGetProfile(
				{
					userName: getPathParams(location).userName
				},
				result => {
					deps.onSetScreenState(id, createScreenUpdater(result, sharedState.user));
				}
			);
			return {
				id,
				componentState: profile,
				key,
				location,
				title: createTitle(profile, sharedState.user)
			};
		},
		render: (state: Screen, sharedState: SharedState) => {
			const pathParams = getPathParams(state.location);
			return (
				<ProfileScreen {
					...{
							...deps,
							...pathParams,
							location: state.location,
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