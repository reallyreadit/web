import * as React from 'react';
import UserArticle from '../../../../../common/models/UserArticle';
import PageResult from '../../../../../common/models/PageResult';
import Fetchable from '../../../../../common/Fetchable';
import CommunityReads from '../../../../../common/models/CommunityReads';
import produce from 'immer';
import LoadingOverlay from '../LoadingOverlay';
import ShareChannel from '../../../../../common/sharing/ShareChannel';
import ShareData from '../../../../../common/sharing/ShareData';
import ArticleLengthFilter from '../ArticleLengthFilter';
import Post from '../../../../../common/models/social/Post';
import UserAccount from '../../../../../common/models/UserAccount';
import Rating from '../../../../../common/models/Rating';
import AotdView from './AotdView';

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
					...updatedArticle
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
							...updatedArticle
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
	isLoading: boolean,
	isPaginated: boolean,
	maxLength: number | null,
	minLength: number | null,
	onChangeLengthRange: (min: number | null, max: number | null) => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount
}> {
	public render() {
		return (
			<div className="community-reads-list_g4cy3n">
				<div className="controls">
					<ArticleLengthFilter
						max={this.props.maxLength}
						min={this.props.minLength}
						onChange={this.props.onChangeLengthRange}
					/>
				</div>
				{this.props.isLoading ?
					<LoadingOverlay position="static" /> :
					<AotdView
						aotd={this.props.aotd}
						aotdHasAlert={this.props.aotdHasAlert}
						articles={this.props.articles}
						isPaginated={this.props.isPaginated}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onPostArticle={this.props.onPostArticle}
						onRateArticle={this.props.onRateArticle}
						onReadArticle={this.props.onReadArticle}
						onShare={this.props.onShare}
						onToggleArticleStar={this.props.onToggleArticleStar}
						onViewAotdHistory={this.props.onViewAotdHistory}
						onViewComments={this.props.onViewComments}
						onViewProfile={this.props.onViewProfile}
						user={this.props.user}
					/>}
			</div>
		);
	}
}