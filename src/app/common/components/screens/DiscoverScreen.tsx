import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Rating from '../../../../common/models/Rating';
import ArticleUpdatedEvent from '../../../../common/models/ArticleUpdatedEvent';
import ShareResponse from '../../../../common/sharing/ShareResponse';
import CommentThread from '../../../../common/models/CommentThread';
import UserAccount from '../../../../common/models/UserAccount';
import RouteLocation from '../../../../common/routing/RouteLocation';
import { SharedState, Screen } from '../Root';
import ScreenContainer from '../ScreenContainer';
import ShareData from '../../../../common/sharing/ShareData';

interface Props {
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onNavTo: (url: string) => boolean,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (event: ArticleUpdatedEvent) => void) => Function,
	onShare: (data: ShareData) => ShareResponse,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	onViewProfile: (userName: string) => void,
	onViewThread: (comment: CommentThread) => void,
	user: UserAccount
}

class DiscoverScreen extends React.Component<Props> {
	public render() {
		return (
			<ScreenContainer className="discover-screen_esmkvy">
				<h1>Discover</h1>
			</ScreenContainer>
		);
	}
}

export default function createDiscoverScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Pick<Props, Exclude<keyof Props, 'user'>>
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: 'Discover'
		}),
		render: (screen: Screen, sharedState: SharedState) => (
			<DiscoverScreen
				onCopyTextToClipboard={services.onCopyTextToClipboard}
				onCreateAbsoluteUrl={services.onCreateAbsoluteUrl}
				onNavTo={services.onNavTo}
				onPostArticle={services.onPostArticle}
				onRateArticle={services.onRateArticle}
				onReadArticle={services.onReadArticle}
				onRegisterArticleChangeHandler={services.onRegisterArticleChangeHandler}
				onShare={services.onShare}
				onToggleArticleStar={services.onToggleArticleStar}
				onViewComments={services.onViewComments}
				onViewProfile={services.onViewProfile}
				onViewThread={services.onViewThread}
				user={sharedState.user}
			/>
		)
	};
}