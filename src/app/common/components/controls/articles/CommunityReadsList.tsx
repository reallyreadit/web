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
import UserArticle from '../../../../../common/models/UserArticle';
import PageResult from '../../../../../common/models/PageResult';
import Fetchable from '../../../../../common/Fetchable';
import CommunityReads from '../../../../../common/models/CommunityReads';
import produce from 'immer';
import ShareResponse from '../../../../../common/sharing/ShareResponse';
import { ShareEvent } from '../../../../../common/sharing/ShareEvent';
import Post from '../../../../../common/models/social/Post';
import UserAccount from '../../../../../common/models/UserAccount';
import Rating from '../../../../../common/models/Rating';
import AotdView, { Sort } from './AotdView';
import { NavReference } from '../../Root';
import {DeviceType} from '../../../../../common/DeviceType';
import { ShareChannelData } from '../../../../../common/sharing/ShareData';

interface State {
	communityReads: Fetchable<CommunityReads>,
	posts?: Fetchable<PageResult<Post>>
}
export function updateCommunityReads(this: React.Component<{}, State>, updatedArticle: UserArticle, isCompletionCommit: boolean) {
	if (
		this.state.communityReads.value &&
		(
			[this.state.communityReads.value.aotd]
				.concat(this.state.communityReads.value.articles.items)
				.some(article => article.id === updatedArticle.id) ||
			(!this.state.communityReads.value.userReadCount && isCompletionCommit)
		)
	) {
		this.setState(produce((prevState: State) => {
			if (prevState.communityReads.value.aotd.id === updatedArticle.id) {
				// merge objects in case the new object is missing properties due to outdated iOS client
				prevState.communityReads.value.aotd = {
					...prevState.communityReads.value.aotd,
					...updatedArticle,
					dateStarred: updatedArticle.dateStarred
				};
			}
			prevState.communityReads.value.articles.items.forEach((article, index, articles) => {
				if (article.id === updatedArticle.id) {
					// merge objects in case the new object is missing properties due to outdated iOS client
					articles.splice(
						articles.indexOf(article),
						1,
						{
							...article,
							...updatedArticle,
							dateStarred: updatedArticle.dateStarred
						}
					);
				}
			});
			if (!prevState.communityReads.value.userReadCount && isCompletionCommit) {
				prevState.communityReads.value.userReadCount = 1;
			}
		}));
	}
}
export default class extends React.PureComponent<{
	aotd: UserArticle,
	aotdHasAlert: boolean,
	articles: PageResult<UserArticle>,
	deviceType: DeviceType,
	isLoading: boolean,
	maxLength: number | null,
	minLength: number | null,
	onChangeSort: (sort: Sort) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onNavTo: (ref: NavReference) => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLElement>) => void,
	onShare: (data: ShareEvent) => ShareResponse,
	onShareViaChannel: (data: ShareChannelData) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	sort: Sort,
	user: UserAccount
}> {
	public render() {
		return (
			<div className="community-reads-list_g4cy3n">
				<AotdView
					aotd={this.props.aotd}
					aotdHasAlert={this.props.aotdHasAlert}
					articles={this.props.articles}
					deviceType={this.props.deviceType}
					isLoading={this.props.isLoading}
					onChangeSort={this.props.onChangeSort}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onNavTo={this.props.onNavTo}
					onPostArticle={this.props.onPostArticle}
					onRateArticle={this.props.onRateArticle}
					onReadArticle={this.props.onReadArticle}
					onShare={this.props.onShare}
					onShareViaChannel={this.props.onShareViaChannel}
					onToggleArticleStar={this.props.onToggleArticleStar}
					onViewAotdHistory={this.props.onViewAotdHistory}
					onViewComments={this.props.onViewComments}
					onViewProfile={this.props.onViewProfile}
					sort={this.props.sort}
					user={this.props.user}
				/>
			</div>
		);
	}
}