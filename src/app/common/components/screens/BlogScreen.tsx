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
import ShareData, {
	ShareChannelData,
} from '../../../../common/sharing/ShareData';
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
import PublisherArticleQuery from '../../../../common/models/articles/PublisherArticleQuery';
import { DeviceType } from '../../../../common/DeviceType';
import { NavReference, SharedState, Screen } from '../Root';
import RouteLocation from '../../../../common/routing/RouteLocation';

export interface Props {
	deviceType: DeviceType;
	onCreateAbsoluteUrl: (path: string) => string;
	onGetPublisherArticles: FetchFunctionWithParams<
		PublisherArticleQuery,
		PageResult<UserArticle>
	>;
	onNavTo: (ref: NavReference) => void;
	onPostArticle: (article: UserArticle) => void;
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>;
	onReadArticle: (
		article: UserArticle,
		e: React.MouseEvent<HTMLElement>
	) => void;
	onRegisterArticleChangeHandler: (
		handler: (event: ArticleUpdatedEvent) => void
	) => Function;
	onShare: (data: ShareData) => ShareResponse;
	onShareViaChannel: (data: ShareChannelData) => void;
	onToggleArticleStar: (article: UserArticle) => Promise<void>;
	onViewComments: (article: UserArticle) => void;
	onViewProfile: (userName: string) => void;
	user: UserAccount | null;
}
interface State {
	articles: Fetchable<PageResult<UserArticle>>;
	isScreenLoading: boolean;
	maxLength: number | null;
	minLength: number | null;
}
class BlogScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changePageNumber = (pageNumber: number) => {
		this.setState({
			articles: { isLoading: true },
		});
		this.fetchArticles(pageNumber, this.state.minLength, this.state.maxLength);
	};
	constructor(props: Props) {
		super(props);
		const minLength: number | null = null,
			maxLength: number | null = null,
			articles = this.fetchArticles(1, minLength, maxLength, () => {
				this.setState({
					isScreenLoading: false,
				});
			});
		this.state = {
			articles,
			isScreenLoading: articles.isLoading,
			maxLength,
			minLength,
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
	private fetchArticles(
		pageNumber: number,
		minLength: number | null,
		maxLength: number | null,
		callback?: () => void
	) {
		return this.props.onGetPublisherArticles(
			{
				slug: 'blogreadupcom',
				pageSize: 40,
				pageNumber,
				minLength,
				maxLength,
			},
			this._asyncTracker.addCallback((articles) => {
				this.setState({ articles });
				if (callback) {
					callback();
				}
			})
		);
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
			<div className="blog-screen_61pk1b">
				{this.state.articles.isLoading ? (
					<LoadingOverlay />
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
			</div>
		);
	}
}

export default function createBlogScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: {
				default: 'From the Readup Blog'
			},
		}),
		render: (state: Screen, sharedState: SharedState) => (
			<BlogScreen
				{...{
					...deps,
					user: sharedState.user,
				}}
			/>
		),
	};
}
