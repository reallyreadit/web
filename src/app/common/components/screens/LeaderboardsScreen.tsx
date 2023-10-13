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
import UserAccount from '../../../../common/models/UserAccount';
import FormDialog from '../../../../common/components/FormDialog';
import {
	FetchFunction,
	FetchFunctionWithParams,
} from '../../serverApi/ServerApi';
import Leaderboards from '../../../../common/models/Leaderboards';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ReaderLeaderboards from './LeaderboardScreen/ReaderLeaderboards';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { Screen, SharedState, NavReference, NavOptions } from '../Root';
import Fetchable from '../../../../common/Fetchable';
import AsyncTracker from '../../../../common/AsyncTracker';
import LoadingOverlay from '../controls/LoadingOverlay';
import HeaderSelector from '../HeaderSelector';
import AuthorLeaderboards from './LeaderboardScreen/AuthorLeaderboards';
import { DeviceType } from '../../../../common/DeviceType';
import Panel from '../BrowserRoot/Panel';
import AuthorLeaderboardsRequest from '../../../../common/models/stats/AuthorLeaderboardsRequest';
import AuthorRanking from '../../../../common/models/AuthorRanking';
import AuthorLeaderboardsTimeWindow from '../../../../common/models/stats/AuthorLeaderboardsTimeWindow';
import ScreenKey from '../../../../common/routing/ScreenKey';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';

interface Props {
	deviceType: DeviceType;
	view: View;
	location: RouteLocation;
	onBeginOnboarding: (analyticsAction: string) => void;
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void;
	onCloseDialog: () => void;
	onCreateAbsoluteUrl: (path: string) => string;
	onCreateStaticContentUrl: (path: string) => string;
	onGetAuthorLeaderboards: FetchFunctionWithParams<AuthorLeaderboardsRequest, AuthorRanking[]>,
	onOpenNewPlatformNotificationRequestDialog: () => void;
	onGetReaderLeaderboards: FetchFunction<Leaderboards>;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onRegisterArticleChangeHandler: (
		handler: (event: ArticleUpdatedEvent) => void
	) => Function;
	onSetScreenState: (
		id: number,
		nextState: (prevState: Screen) => Partial<Screen>
	) => void;
	onViewAuthor: (slug: string, name: string) => void;
	onViewProfile: (userName: string) => void;
	screenId: number;
	user: UserAccount | null;
}
enum View {
	Authors = 'Writers',
	Readers = 'Readers',
}

export enum LeaderboardsViewParams {
	Readers = 'readers',
	Writers = 'writers',
}

interface State {
	authorLeaderboards: Fetchable<AuthorRanking[]> | null,
	authorLeaderboardsTimeWindow: AuthorLeaderboardsTimeWindow,
	isScreenLoading: boolean,
	readerLeaderboards: Fetchable<Leaderboards> | null
}

class LeaderboardsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeAuthorLeaderboardsTimeWindow = (timeWindow: AuthorLeaderboardsTimeWindow) => {
		this.setState({
			authorLeaderboards: this.props.onGetAuthorLeaderboards(
				{
					timeWindow
				},
				this._asyncTracker.addCallback(
					authorLeaderboards => {
						this.setState({
							authorLeaderboards
						});
					}
				)
			),
			authorLeaderboardsTimeWindow: timeWindow
		});
	};
	private readonly _changeView = (value: string) => {
		const view = value as View;
		if (view === this.props.view) {
			return;
		}
		switch (view) {
			case View.Authors:
				this.setState({
					authorLeaderboards: this.props.onGetAuthorLeaderboards(
						{
							timeWindow: this.state.authorLeaderboardsTimeWindow
						},
						this._asyncTracker.addCallback(
							authorLeaderboards => {
								this.setState({
									authorLeaderboards
								});
							}
						)
					),
					readerLeaderboards: null,
				});
				break;
			case View.Readers:
				this.setState({
					authorLeaderboards: null,
					authorLeaderboardsTimeWindow: AuthorLeaderboardsTimeWindow.PastWeek,
					readerLeaderboards: this.props.onGetReaderLeaderboards(
						this._asyncTracker.addCallback((readerLeaderboards) => {
							this.setState({
								readerLeaderboards,
							});
						})
					),
				});
				break;
		}
		this.props.onSetScreenState(this.props.screenId, () => ({
			location: {
				path:
					view === View.Readers
						? '/leaderboards/readers'
						: '/leaderboards/writers',
			},
		}));
	};
	private readonly _headerSelectorItems = [
		{
			value: View.Authors,
		},
		{
			value: View.Readers,
		},
	];
	private readonly _openExplainer = (
		title: string,
		content: React.ReactNode
	) => {
		this.props.onOpenDialog(
			<FormDialog
				closeButtonText="Ok"
				onClose={this.props.onCloseDialog}
				size="small"
				title={title}
			>
				{content}
			</FormDialog>
		);
	};
	constructor(props: Props) {
		super(props);
		const authorLeaderboardsTimeWindow = AuthorLeaderboardsTimeWindow.PastWeek;

		// load initial data for the initially selected leaderboard
		if (props.view === View.Readers) {
			const readerLeaderboards = this.props.onGetReaderLeaderboards(
				this._asyncTracker.addCallback((readerLeaderboards) => {
					this.setState({
						readerLeaderboards,
						isScreenLoading: false,
					});
				})
			);
			this.state = {
				isScreenLoading: readerLeaderboards.isLoading,
				readerLeaderboards,
				authorLeaderboards: null,
				authorLeaderboardsTimeWindow,
			};
		} else {
			const authorLeaderboards = props.onGetAuthorLeaderboards(
				{
					timeWindow: authorLeaderboardsTimeWindow
				},
				this._asyncTracker.addCallback(
					authorLeaderboards => {
						this.setState({
							authorLeaderboards,
							isScreenLoading: false
						});
					}
				)
			);
			this.state = {
				isScreenLoading: authorLeaderboards.isLoading,
				authorLeaderboards,
				authorLeaderboardsTimeWindow,
				readerLeaderboards: null,
			};
		}

		// reload data when an article has changed (this may have an influence on statistics)
		// currently these events are only spawned in the local user session
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (!event.isCompletionCommit) {
						return;
					}
					switch (props.view) {
						case View.Authors:
							props.onGetAuthorLeaderboards(
								{
									timeWindow: this.state.authorLeaderboardsTimeWindow
								},
								this._asyncTracker.addCallback(
									authorLeaderboards => {
										this.setState({
											authorLeaderboards
										});
									}
								)
							);
							break;
						case View.Readers:
							props.onGetReaderLeaderboards(
								this._asyncTracker.addCallback((readerLeaderboards) => {
									this.setState({
										readerLeaderboards,
									});
								})
							);
							break;
					}
				}
			)
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			!this.props.user !== !prevProps.user &&
			this.props.view === View.Readers
		) {
			this.setState({
				readerLeaderboards: this.props.onGetReaderLeaderboards(
					this._asyncTracker.addCallback((readerLeaderboards) => {
						this.setState({
							readerLeaderboards,
						});
					})
				),
			});
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}

	public render() {
		if (this.state.isScreenLoading) {
			return (
				<LoadingOverlay />
			);
		}
		return (
			<div className="leaderboards-screen_wuzsob">
				<Panel className="main">
					<HeaderSelector
						disabled={
							this.state.authorLeaderboards?.isLoading ||
							this.state.readerLeaderboards?.isLoading
						}
						items={this._headerSelectorItems}
						onChange={this._changeView}
						value={this.props.view}
					/>
					{this.props.view === View.Authors ?
						<AuthorLeaderboards
							onChangeTimeWindow={this._changeAuthorLeaderboardsTimeWindow}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onViewAuthor={this.props.onViewAuthor}
							rankings={this.state.authorLeaderboards}
							timeWindow={this.state.authorLeaderboardsTimeWindow}
						/> :
						<ReaderLeaderboards
							leaderboards={this.state.readerLeaderboards}
							onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
							onOpenExplainer={this._openExplainer}
							onViewProfile={this.props.onViewProfile}
							user={this.props.user}
						/>}
				</Panel>
			</div>
		);
	}
}
export default function createLeaderboardsScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Pick<
		Props,
		Exclude<keyof Props, 'location' | 'screenId' | 'user' | 'view'>
	>
) {
	const route = findRouteByKey(routes, ScreenKey.Leaderboards);
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: {
				default: 'Leaderboards'
			},
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<LeaderboardsScreen
				deviceType={services.deviceType}
				location={screen.location}
				onBeginOnboarding={services.onBeginOnboarding}
				onCopyAppReferrerTextToClipboard={
					services.onCopyAppReferrerTextToClipboard
				}
				onCloseDialog={services.onCloseDialog}
				onCreateAbsoluteUrl={services.onCreateAbsoluteUrl}
				onCreateStaticContentUrl={services.onCreateStaticContentUrl}
				onOpenNewPlatformNotificationRequestDialog={services.onOpenNewPlatformNotificationRequestDialog}
				onGetAuthorLeaderboards={services.onGetAuthorLeaderboards}
				onGetReaderLeaderboards={services.onGetReaderLeaderboards}
				onNavTo={services.onNavTo}
				onOpenDialog={services.onOpenDialog}
				onRegisterArticleChangeHandler={services.onRegisterArticleChangeHandler}
				onSetScreenState={services.onSetScreenState}
				onViewAuthor={services.onViewAuthor}
				onViewProfile={services.onViewProfile}
				screenId={screen.id}
				user={sharedState.user}
				view={
					route.getPathParams(screen.location.path)['view'] ===
					LeaderboardsViewParams.Readers
						? View.Readers
						: View.Authors
				}
			/>
		),
	};
}
