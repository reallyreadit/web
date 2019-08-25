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
import ArticleLengthFilter from '../ArticleLengthFilter';
import SelectList from '../../../../../common/components/SelectList';

const sortOptions: { [key: string]: CommunityReadSort } = {
	'Trending': CommunityReadSort.Hot,
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
			(!this.state.communityReads.value.userReadCount && isCompletionCommit)
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
			if (!prevState.communityReads.value.userReadCount && isCompletionCommit) {
				prevState.communityReads.value.userReadCount = 1;
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
	onLengthRangeChange: (min: number, max: number) => void,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onSortChange: (sort: CommunityReadSort, timeWindow?: CommunityReadTimeWindow) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	maxLength: number | null,
	minLength: number | null,
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
					onPost={this.props.onPostArticle}
					onRead={this.props.onReadArticle}
					onShare={this.props.onShare}
					onToggleStar={this.props.onToggleArticleStar}
					onViewComments={this.props.onViewComments}
				/>
				<div className="controls">
					<form
						autoComplete="off"
						className="sort"
					>
						<SelectList
							onChange={this._changeSort}
							options={
								Object
									.keys(sortOptions)
									.map(key => ({
										key,
										value: sortOptions[key]
									}))
							}
							value={this.props.sort}
						/>
						{this.props.timeWindow != null ?
							<SelectList
								onChange={this._changeTimeWindow}
								options={
									Object
										.keys(timeWindowOptions)
										.map(key => ({
											key,
											value: timeWindowOptions[key]
										}))
								}
								value={this.props.timeWindow}
							/> :
							null}
					</form>
					<div className="filter-container">
						<ArticleLengthFilter
							max={this.props.maxLength}
							min={this.props.minLength}
							onChange={this.props.onLengthRangeChange}
						/>
					</div>
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
									onPost={this.props.onPostArticle}
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