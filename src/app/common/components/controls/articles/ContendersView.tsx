import * as React from 'react';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import List from '../List';
import UserArticle from '../../../../../common/models/UserArticle';
import Rating from '../../../../../common/models/Rating';
import { ShareEvent } from '../../../../../common/sharing/ShareEvent';
import ShareResponse from '../../../../../common/sharing/ShareResponse';
import PageResult from '../../../../../common/models/PageResult';
import UserAccount from '../../../../../common/models/UserAccount';
import RankCallout from './RankCallout';
import SelectList from '../../../../../common/components/SelectList';
import LoadingOverlay from '../LoadingOverlay';
import CommunityReadSort from '../../../../../common/models/CommunityReadSort';
import { NavReference } from '../../Root';
import {DeviceType} from '../../../../../common/DeviceType';
import { ShareChannelData } from '../../../../../common/sharing/ShareData';

export type Sort = CommunityReadSort.Hot | CommunityReadSort.New;
export default class AotdView extends React.Component<{
	aotd: UserArticle,
	aotdHasAlert?: boolean,
	articles: PageResult<UserArticle>,
	deviceType: DeviceType,
	isLoading: boolean,
	maxLength: number | null,
	minLength: number | null,
	onChangeSort?: (sort: Sort) => void,
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
	user: UserAccount | null
}> {
	private readonly _changeSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onChangeSort(
			parseInt(event.target.value, 10) as Sort
		);
	};
	private readonly _sortOptions = [
		{
			key: 'Top',
			value: CommunityReadSort.Hot
		},
		{
			key: 'New',
			value: CommunityReadSort.New
		}
	];
	public render() {
		return (
			<div className="contenders-view_a7cu96">
				<div className="section-header">
					<label>Contenders for tomorrow</label>
					{this.props.onChangeSort ?
						<SelectList
							disabled={this.props.isLoading}
							onChange={this._changeSort}
							options={this._sortOptions}
							value={this.props.sort}
						/> :
						null}
				</div>
				{this.props.isLoading ?
					<LoadingOverlay position="static" /> :
					<List>
						{this.props.articles.items.map(
							(article, index) => (
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
										rankCallout = {
											index === 0 && !this.props.user ?
											<RankCallout /> :
											null
										}
										user={this.props.user}
									/>
								</li>
							)
						)}
					</List>}
			</div>
		);
	}
}