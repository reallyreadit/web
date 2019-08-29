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
import ContentBox from '../../../../../common/components/ContentBox';
import HeaderSelector from '../../HeaderSelector';
import Post from '../../../../../common/models/social/Post';
import PostDetails from '../../../../../common/components/PostDetails';
import UserAccount from '../../../../../common/models/UserAccount';
import CommentThread from '../../../../../common/models/CommentThread';

export enum View {
	Trending = 'Trending',
	Following = 'Following'
}
const headerSelectorLists = [View.Trending, View.Following];
const sortOptions: { [key: string]: CommunityReadSort } = {
	'Now': CommunityReadSort.Hot,
	'All Time': CommunityReadSort.Top,
	'Most Read': CommunityReadSort.MostRead,
	'Most Comments': CommunityReadSort.MostComments,
	'Top Rated': CommunityReadSort.HighestRated
};
const timeWindowOptions: { [key: string]: CommunityReadTimeWindow } = {
	'Past 24 Hours': CommunityReadTimeWindow.PastDay,
	'Past Week': CommunityReadTimeWindow.PastWeek,
	'Past Month': CommunityReadTimeWindow.PastMonth,
	'Past Year': CommunityReadTimeWindow.PastYear,
	'Of All Time': CommunityReadTimeWindow.AllTime
};
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
				.concat(
					this.state.posts && this.state.posts.value ?
						this.state.posts.value.items.map(post => post.article) :
						[]
				)
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
			if (prevState.posts && prevState.posts.value) {
				prevState.posts.value.items.forEach((post, index, posts) => {
					if (post.article.id === updatedArticle.id) {
						post.article = updatedArticle;
					}
				});
			}
			if (!prevState.communityReads.value.userReadCount && isCompletionCommit) {
				prevState.communityReads.value.userReadCount = 1;
			}
		}));
	}
}
export default class extends React.PureComponent<{
	aotd?: UserArticle,
	articles?: PageResult<UserArticle>,
	isLoading: boolean,
	maxLength: number | null,
	minLength: number | null,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onParamsChanged: (view: View, sort: CommunityReadSort, timeWindow: CommunityReadTimeWindow | null, minLength: number | null, maxLength: number | null) => void,
	onPostArticle: (article: UserArticle) => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	posts?: PageResult<Post>,
	sort: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow,
	user: UserAccount,
	view: View
}> {
	private readonly _changeLengthRange = (min: number | null, max: number | null) => {
		this.props.onParamsChanged(this.props.view, this.props.sort, this.props.timeWindow, min, max);
	};
	private readonly _changeList = (value: string) => {
		this.props.onParamsChanged(value as View, CommunityReadSort.Hot, null, null, null);
	};
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
		this.props.onParamsChanged(this.props.view, sort, timeWindow, this.props.minLength, this.props.maxLength);
	};
	private readonly _changeTimeWindow = (e: React.ChangeEvent<HTMLSelectElement>) => {
		this.props.onParamsChanged(this.props.view, this.props.sort, parseInt(e.target.value), this.props.minLength, this.props.maxLength);
	};
	public render() {
		return (
			<div className="community-reads-list_g4cy3n">
				<div className="controls">
					<HeaderSelector
						items={headerSelectorLists}
						onChange={this._changeList}
						value={this.props.view}
					/>
					<div className="select-group">
						{this.props.view === View.Trending ?
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
							</form> :
							null}
						<ArticleLengthFilter
							max={this.props.maxLength}
							min={this.props.minLength}
							onChange={this._changeLengthRange}
						/>
					</div>
				</div>
				{this.props.isLoading ?
					<LoadingOverlay position="static" /> :
					<>
						{this.props.view === View.Trending ?
							<>
								{this.props.sort === CommunityReadSort.Hot ?
									<ContentBox className="aotd">
										<div className="flair">Article of the Day</div>
										<ArticleDetails
											article={this.props.aotd}
											isUserSignedIn
											onCopyTextToClipboard={this.props.onCopyTextToClipboard}
											onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
											onPost={this.props.onPostArticle}
											onRead={this.props.onReadArticle}
											onShare={this.props.onShare}
											onToggleStar={this.props.onToggleArticleStar}
											onViewComments={this.props.onViewComments}
										/>
									</ContentBox> :
									null}
								<ArticleList>
									{this.props.articles.items.map(article =>
										<li key={article.id}>
											<ArticleDetails
												article={article}
												isUserSignedIn
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
								</ArticleList>
							</> :
							<ArticleList>
								{this.props.posts.items.map(
									post => (
										<li key={post.date}>
											<PostDetails
												onCopyTextToClipboard={this.props.onCopyTextToClipboard}
												onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
												onRead={this.props.onReadArticle}
												onPost={this.props.onPostArticle}
												onShare={this.props.onShare}
												onToggleStar={this.props.onToggleArticleStar}
												onViewComments={this.props.onViewComments}
												onViewProfile={this.props.onViewProfile}
												onViewThread={this.props.onViewThread}
												post={post}
												user={this.props.user}
											/>
										</li>
									)
								)}
							</ArticleList>}
					</>}
			</div>
		);
	}
}