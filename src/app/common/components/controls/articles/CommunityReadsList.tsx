import * as React from 'react';
import UserArticle from '../../../../../common/models/UserArticle';
import ArticleList from './ArticleList';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import PageResult from '../../../../../common/models/PageResult';
import Fetchable from '../../../../../common/Fetchable';
import CommunityReads from '../../../../../common/models/CommunityReads';
import produce from 'immer';
import CommunityReadSort from '../../../../../common/models/CommunityReadSort';
import LoadingOverlay from '../LoadingOverlay';
import ShareChannel from '../../../../../common/sharing/ShareChannel';
import ShareData from '../../../../../common/sharing/ShareData';
import CommunityReadTimeWindow from '../../../../../common/models/CommunityReadTimeWindow';

const sortOptions: { [key: string]: CommunityReadSort } = {
	'Hot': CommunityReadSort.Hot,
	'Most Read': CommunityReadSort.MostRead,
	'Most Comments': CommunityReadSort.MostComments,
	'Top Rated': CommunityReadSort.HighestRated,
	'Hall of Fame': CommunityReadSort.Top
};
const timeWindowOptions: { [key: string]: CommunityReadTimeWindow } = {
	'Past 24 Hours': CommunityReadTimeWindow.PastDay,
	'Past Week': CommunityReadTimeWindow.PastWeek,
	'Past Month': CommunityReadTimeWindow.PastMonth,
	'Past Year': CommunityReadTimeWindow.PastYear,
	'Of All Time': CommunityReadTimeWindow.AllTime
};
interface State {
	communityReads: Fetchable<CommunityReads>
}
export function updateCommunityReads(this: React.Component<{}, State>, updatedArticle: UserArticle, isCompletionCommit: boolean) {
	if (
		this.state.communityReads.value &&
		(
			[this.state.communityReads.value.aotd]
				.concat(this.state.communityReads.value.articles.items)
				.some(article => article.id === updatedArticle.id) ||
			(!this.state.communityReads.value.userStats && isCompletionCommit)
		)
	) {
		this.setState(produce<State>(prevState => {
			if (prevState.communityReads.value.aotd.id === updatedArticle.id) {
				prevState.communityReads.value.aotd = updatedArticle;
			}
			prevState.communityReads.value.articles.items.forEach((article, index, articles) => {
				if (article.id === updatedArticle.id) {
					articles.splice(articles.indexOf(article), 1, updatedArticle);
				}
			});
			if (!prevState.communityReads.value.userStats && isCompletionCommit) {
				// ugly hack to dismiss welcome info box
				prevState.communityReads.value.userStats = {
					readCount: 1,
					readCountRank: 0,
					streak: null,
					streakRank: null,
					userCount: 0
				};
			}
		}));
	}
}
export default class extends React.PureComponent<{
	aotd: UserArticle,
	articles: PageResult<UserArticle>,
	isLoadingArticles: boolean,
	isUserSignedIn: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onSortChange: (sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	sort: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow
}, {}> {
	private readonly _changeSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const sort = parseInt(e.target.value) as CommunityReadSort;
		let timeWindow: CommunityReadTimeWindow;
		if (sort === CommunityReadSort.Hot || sort === CommunityReadSort.Top) {
			timeWindow = null;
		} else {
			timeWindow = this.props.timeWindow != null ?
				this.props.timeWindow :
				CommunityReadTimeWindow.PastDay;
		}
		this.props.onSortChange(sort, timeWindow);
	};
	private readonly _changeTimeWindow = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onSortChange(this.props.sort, parseInt(e.target.value));
	};
	public render() {
		return (
			<div className="community-reads-list_g4cy3n">
				<h3>Article of the day</h3>
				<ArticleDetails
					article={this.props.aotd}
					isUserSignedIn={this.props.isUserSignedIn}
					onCopyTextToClipboard={this.props.onCopyTextToClipboard}
					onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
					onRead={this.props.onReadArticle}
					onShare={this.props.onShare}
					onToggleStar={this.props.onToggleArticleStar}
					onViewComments={this.props.onViewComments}
				/>
				<div className="sort">
					<label>Sort</label>
					<select
						onChange={this._changeSort}
						value={this.props.sort}
					>
						{Object
							.keys(sortOptions)
							.map(key => (
								<option
									key={key}
									value={sortOptions[key]}
								>
									{key}
								</option>
							))}
					</select>
					{this.props.timeWindow != null ?
						<select
							onChange={this._changeTimeWindow}
							value={this.props.timeWindow}
						>
							{Object
								.keys(timeWindowOptions)
								.map(key => (
									<option
										key={key}
										value={timeWindowOptions[key]}
									>
										{key}
									</option>
								))}
						</select> :
						null}
				</div>
				{this.props.isLoadingArticles ?
					<LoadingOverlay position="static" /> :
					<ArticleList>
						{this.props.articles.items.map(article =>
							<li key={article.id}>
								<ArticleDetails
									article={article}
									isUserSignedIn={this.props.isUserSignedIn}
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShare}
									onToggleStar={this.props.onToggleArticleStar}
									onViewComments={this.props.onViewComments}
								/>
							</li>
						)}
					</ArticleList>}
			</div>
		);
	}
}