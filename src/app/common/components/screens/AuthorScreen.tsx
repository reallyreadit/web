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
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import UserArticle from '../../../../common/models/UserArticle';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import { ShareEvent } from '../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import Fetchable from '../../../../common/Fetchable';
import PageResult from '../../../../common/models/PageResult';
import LoadingOverlay from '../controls/LoadingOverlay';
import AsyncTracker from '../../../../common/AsyncTracker';
import produce from 'immer';
import List from '../controls/List';
import PageSelector from '../controls/PageSelector';
import ArticleDetails from '../../../../common/components/ArticleDetails';
import Rating from '../../../../common/models/Rating';
import UserAccount from '../../../../common/models/UserAccount';
import AuthorArticleQuery from '../../../../common/models/articles/AuthorArticleQuery';
import AuthorProfile from '../../../../common/models/authors/AuthorProfile';
import InfoBox from '../../../../common/components/InfoBox';
import { JsonLd } from 'react-schemaorg';
import { ProfilePage } from 'schema-dts';
import AuthorProfileRequest from '../../../../common/models/authors/AuthorProfileRequest';
import RouteLocation from '../../../../common/routing/RouteLocation';
import {
	Screen,
	SharedState,
	NavMethod,
	NavOptions,
	NavReference,
} from '../Root';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Panel from '../BrowserRoot/Panel';
import { DeviceType } from '../../../../common/DeviceType';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

interface Props {
	authorSlug: string;
	deviceType: DeviceType;
	location: RouteLocation;
	onBeginOnboarding: (analyticsAction: string) => void;
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void;
	onCreateAbsoluteUrl: (path: string) => string;
	onCreateStaticContentUrl: (path: string) => string;
	onGetAuthorArticles: FetchFunctionWithParams<
		AuthorArticleQuery,
		PageResult<UserArticle>
	>;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
	onOpenNewPlatformNotificationRequestDialog: () => void;
	onPostArticle: (article: UserArticle) => void;
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>;
	onReadArticle: (
		article: UserArticle,
		e: React.MouseEvent<HTMLElement>
	) => void;
	onRegisterArticleChangeHandler: (
		handler: (event: ArticleUpdatedEvent) => void
	) => Function;
	onShare: (data: ShareEvent) => ShareResponse;
	onShareViaChannel: (data: ShareChannelData) => void;
	onToggleArticleStar: (article: UserArticle) => Promise<void>;
	onViewComments: (article: UserArticle) => void;
	onViewProfile: (userName: string, options?: NavOptions) => void;
	profile: Fetchable<AuthorProfile>;
	user: UserAccount | null;
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>;
	isScreenLoading: boolean;
}
class AuthorScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			articles: {
				isLoading: true,
			},
		});
		this.fetchArticles(pageNumber);
	};
	constructor(props: Props) {
		super(props);
		const articles = this.fetchArticles(1);
		this.state = {
			articles,
			isScreenLoading: props.profile.isLoading || articles.isLoading,
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler((event) => {
				if (
					this.state.articles.value &&
					this.state.articles.value.items.some(
						(article) => article.id === event.article.id
					)
				) {
					this.setState(
						produce((prevState: State) => {
							prevState.articles.value.items.forEach(
								(article, index, articles) => {
									if (article.id === event.article.id) {
										// merge objects in case the new object is missing properties due to outdated iOS client
										articles.splice(articles.indexOf(article), 1, {
											...article,
											...event.article,
											dateStarred: event.article.dateStarred,
										});
									}
								}
							);
						})
					);
				}
			})
		);
	}
	private fetchArticles(pageNumber: number) {
		return this.props.onGetAuthorArticles(
			{
				slug: this.props.authorSlug,
				pageSize: 40,
				pageNumber,
				minLength: null,
				maxLength: null,
			},
			this._asyncTracker.addCallback((articles) => {
				this.setState({
					articles,
					isScreenLoading: this.props.profile.isLoading,
				});
			})
		);
	}
	public componentDidUpdate(prevProps: Props) {
		if (
			prevProps.profile.isLoading &&
			!this.props.profile.isLoading &&
			!this.state.articles.isLoading
		) {
			this.setState({
				isScreenLoading: false,
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
		if (!this.props.profile.value) {
			return (
				<InfoBox style="normal">
					<p>Author not found.</p>
				</InfoBox>
			);
		}
		return (
			<div className="author-screen_2cri7v">
				<Panel className="main">
					<div className="profile">
						<h1>{this.props.profile.value.name}</h1>
					</div>
					{this.state.articles.isLoading ? (
						<LoadingOverlay />
					) : !this.state.articles.value ? (
						<InfoBox style="normal">
							<p>Error loading articles.</p>
						</InfoBox>
					) : !this.state.articles.value.items.length ? (
						<InfoBox style="normal">
							<p>No articles found.</p>
						</InfoBox>
					) : (
						<>
							<List>
								{this.state.articles.value.items.map((article) => (
									<li key={article.id}>
										<ArticleDetails
											article={article}
											deviceType={this.props.deviceType}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onNavTo={this.props.onNavTo}
											onPost={this.props.onPostArticle}
											onRateArticle={this.props.onRateArticle}
											onRead={this.props.onReadArticle}
											onShare={this.props.onShare}
											onShareViaChannel={this.props.onShareViaChannel}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
											onViewProfile={this.props.onViewProfile}
											showAotdMetadata={false}
											user={this.props.user}
										/>
									</li>
								))}
							</List>
							<PageSelector
								pageNumber={this.state.articles.value.pageNumber}
								pageCount={this.state.articles.value.pageCount}
								onChange={this._changePageNumber}
							/>
						</>
					)}
					<JsonLd<ProfilePage>
						item={{
							'@context': 'https://schema.org',
							'@type': 'ProfilePage',
							description: `Articles written by ${this.props.profile.value.name}`,
							name: this.props.profile.value.name,
						}}
					/>
				</Panel>
			</div>
		);
	}
}
type Dependencies<TScreenKey> = Pick<
	Props,
	Exclude<keyof Props, 'authorSlug' | 'location' | 'profile' | 'user'>
> & {
	onCreateTitle: (profile: Fetchable<AuthorProfile>) => string;
	onGetAuthorProfile: FetchFunctionWithParams<
		AuthorProfileRequest,
		AuthorProfile
	>;
	onSetScreenState: (
		id: number,
		getNextState: (
			currentState: Readonly<Screen<Fetchable<AuthorProfile>>>
		) => Partial<Screen<Fetchable<AuthorProfile>>>
	) => void;
};
function getSlug(location: RouteLocation) {
	return findRouteByKey(routes, ScreenKey.Author).getPathParams(location.path)[
		'slug'
	];
}
export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Dependencies<TScreenKey>
) {
	return {
		create: (id: number, location: RouteLocation, sharedState: SharedState) => {
			const profile = deps.onGetAuthorProfile(
				{
					slug: getSlug(location),
				},
				(profile) => {
					if (profile.value?.userName) {
						deps.onViewProfile(profile.value?.userName, {
							method: NavMethod.Replace,
							screenId: id,
						});
					} else {
						deps.onSetScreenState(
							id,
							produce((currentState: Screen<Fetchable<AuthorProfile>>) => {
								currentState.componentState = profile;
								currentState.title = deps.onCreateTitle(profile);
							})
						);
					}
				}
			);
			return {
				id,
				componentState: profile,
				key,
				location,
				title: deps.onCreateTitle(profile),
			};
		},
		render: (
			state: Screen<Fetchable<AuthorProfile>>,
			sharedState: SharedState
		) => (
			<AuthorScreen
				authorSlug={getSlug(state.location)}
				deviceType={deps.deviceType}
				location={state.location}
				onBeginOnboarding={deps.onBeginOnboarding}
				onCopyAppReferrerTextToClipboard={deps.onCopyAppReferrerTextToClipboard}
				onCreateAbsoluteUrl={deps.onCreateAbsoluteUrl}
				onCreateStaticContentUrl={deps.onCreateStaticContentUrl}
				onGetAuthorArticles={deps.onGetAuthorArticles}
				onNavTo={deps.onNavTo}
				onOpenNewPlatformNotificationRequestDialog={
					deps.onOpenNewPlatformNotificationRequestDialog
				}
				onPostArticle={deps.onPostArticle}
				onRateArticle={deps.onRateArticle}
				onReadArticle={deps.onReadArticle}
				onRegisterArticleChangeHandler={deps.onRegisterArticleChangeHandler}
				onShare={deps.onShare}
				onShareViaChannel={deps.onShareViaChannel}
				onToggleArticleStar={deps.onToggleArticleStar}
				onViewComments={deps.onViewComments}
				onViewProfile={deps.onViewProfile}
				profile={state.componentState}
				user={sharedState.user}
			/>
		),
	};
}
