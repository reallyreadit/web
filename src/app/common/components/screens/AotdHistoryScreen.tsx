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
import ArticleQuery from '../../../../common/models/articles/ArticleQuery';
import ScreenContainer from '../ScreenContainer';
import UserAccount from '../../../../common/models/UserAccount';
import HeaderSelector from '../HeaderSelector';
import CommunityReadsQuery from '../../../../common/models/articles/CommunityReadsQuery';
import CommunityReads from '../../../../common/models/CommunityReads';
import CommunityReadSort from '../../../../common/models/CommunityReadSort';
import { NavOptions, NavReference } from '../Root';
import {DeviceType} from '../../../../common/DeviceType';
import MarketingBanner from '../BrowserRoot/MarketingBanner';
import {variants} from '../../marketingTesting';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { ShareChannelData } from '../../../../common/sharing/ShareData';

enum View {
	Recent = 'Recent',
	BestEver = 'Best Ever'
}
export interface Props {
	deviceType: DeviceType,
	location: RouteLocation,
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onCreateStaticContentUrl: (path: string) => string,
	onGetAotdHistory: FetchFunctionWithParams<ArticleQuery, PageResult<UserArticle>>,
	onGetCommunityReads: FetchFunctionWithParams<CommunityReadsQuery, CommunityReads>,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	title?: string,
	user: UserAccount | null
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>,
	isScreenLoading: boolean,
	view: View,
	maxLength: number | null,
	minLength: number | null
}
export default class AotdHistoryScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeList = (value: string) => {
		const view = value as View;
		if (view !== this.state.view) {
			this.setState({
				articles: {
					isLoading: true
				},
				view: view
			});
			this.fetchArticles(view, 1, this.state.minLength, this.state.maxLength);
		}
	};
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			articles: {
				isLoading: true
			}
		});
		this.fetchArticles(this.state.view, pageNumber, this.state.minLength, this.state.maxLength);
	};
	private readonly _headerSelectorItems = [
		{
			value: View.Recent
		},
		{
			value: View.BestEver
		}
	];
	constructor(props: Props) {
		super(props);
		const
			view = View.Recent,
			minLength: number | null = null,
			maxLength: number | null = null,
			articles = this.fetchArticles(view, 1, minLength, maxLength);
		this.state = {
			articles: articles as Fetchable<PageResult<UserArticle>>,
			view: view,
			isScreenLoading: articles.isLoading,
			maxLength,
			minLength
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(
				event => {
					if (
						this.state.articles.value &&
						this.state.articles.value.items.some(article => article.id === event.article.id)
					) {
						this.setState(produce((prevState: State) => {
							prevState.articles.value.items.forEach((article, index, articles) => {
								if (article.id === event.article.id) {
									// merge objects in case the new object is missing properties due to outdated iOS client
									articles.splice(
										articles.indexOf(article),
										1,
										{
											...article,
											...event.article,
											dateStarred: event.article.dateStarred
										}
									);
								}
							});
						}));
					}
				}
			)
		);
	}
	private fetchArticles(
		view: View,
		pageNumber: number,
		minLength: number | null,
		maxLength: number | null
	) {
		switch (view) {
			case View.Recent:
				return this.props.onGetAotdHistory(
					{
						maxLength,
						minLength,
						pageNumber
					},
					this._asyncTracker.addCallback(
						articles => {
							this.setState({
								articles,
								isScreenLoading: false
							});
						}
					)
				);
			case View.BestEver:
				return this.props.onGetCommunityReads(
					{
						maxLength,
						minLength,
						pageNumber,
						pageSize: 40,
						sort: CommunityReadSort.Top
					},
					this._asyncTracker.addCallback(
						communityReads => {
							this.setState({
								articles: {
									isLoading: false,
									value: communityReads.value.articles
								},
								isScreenLoading: false
							});
						}
					)
				);
		}
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="aotd-history-screen_lpelxe">
				{this.state.isScreenLoading ?
					<LoadingOverlay position="static" /> :
					<>
						{!this.props.user ?
							<MarketingBanner
							analyticsAction="CommentsScreen"
							deviceType={this.props.deviceType}
							marketingVariant={variants[0]}
							location={this.props.location}
							onNavTo={this.props.onNavTo}
							onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
							onCreateStaticContentUrl={this.props.onCreateStaticContentUrl}
						/> : null}
						{this.props.title ?
							<h1>{this.props.title}</h1> :
							null}
						<div className="controls">
							<HeaderSelector
								disabled={this.state.articles.isLoading}
								items={this._headerSelectorItems}
								onChange={this._changeList}
								value={this.state.view}
							/>
						</div>
						{this.state.articles.isLoading ?
							<LoadingOverlay position="static" /> :
							<>
								<List>
									{this.state.articles.value.items.map(
										article => (
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
													user={this.props.user}
												/>
											</li>
										)
									)}
								</List>
								<PageSelector
									pageNumber={this.state.articles.value.pageNumber}
									pageCount={this.state.articles.value.pageCount}
									onChange={this._changePageNumber}
								/>
							</>}
					</>}
			</ScreenContainer>
		);
	}
}