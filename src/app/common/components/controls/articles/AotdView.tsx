import * as React from 'react';
import ArticleDetails from '../../../../../common/components/ArticleDetails';
import ArticleList from './ArticleList';
import UserArticle from '../../../../../common/models/UserArticle';
import Rating from '../../../../../common/models/Rating';
import ShareData from '../../../../../common/sharing/ShareData';
import ShareResponse from '../../../../../common/sharing/ShareResponse';
import PageResult from '../../../../../common/models/PageResult';
import UserAccount from '../../../../../common/models/UserAccount';
import RankCallout from './RankCallout';
import Button from '../../../../../common/components/Button';

export default class AotdView extends React.Component<{
	aotd: UserArticle,
	aotdHasAlert?: boolean,
	articles: PageResult<UserArticle>,
	isPaginated: boolean,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
}> {
	public render() {
		return (
			<div className="aotd-view_hgax0h">
				<div className="section-header">Article of the Day</div>
				<div className="aotd">
					<ArticleDetails
						article={this.props.aotd}
						highlight={this.props.aotdHasAlert}
						onCopyTextToClipboard={this.props.onCopyTextToClipboard}
						onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
						onPost={this.props.onPostArticle}
						onRateArticle={this.props.onRateArticle}
						onRead={this.props.onReadArticle}
						onShare={this.props.onShare}
						onToggleStar={this.props.onToggleArticleStar}
						onViewComments={this.props.onViewComments}
						onViewProfile={this.props.onViewProfile}
						user={this.props.user}
					/>
					<Button
						display="block"
						iconRight="chevron-right"
						intent="default"
						onClick={this.props.onViewAotdHistory}
						style="preferred"
						text="Previous Winners"
					/>
				</div>
				<div className="separator"></div>
				<div className="section-header">Contenders for Tomorrow</div>
				<ArticleList>
					{this.props.articles.items.map(
						(article, index) => (
							<li key={article.id}>
								<ArticleDetails
									article={article}
									onCopyTextToClipboard={this.props.onCopyTextToClipboard}
									onCreateAbsoluteUrl={this.props.onCreateAbsoluteUrl}
									onPost={this.props.onPostArticle}
									onRateArticle={this.props.onRateArticle}
									onRead={this.props.onReadArticle}
									onShare={this.props.onShare}
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
				</ArticleList>	
			</div>
		);
	}
}