import * as React from 'react';
import UserArticle from '../../../../common/models/UserArticle';
import Fetchable from '../../serverApi/Fetchable';
import UserAccount from '../../../../common/models/UserAccount';
import HotTopics from '../../../../common/models/HotTopics';
import HotTopicsList, { updateArticles } from '../controls/articles/HotTopicsList';
import LoadingOverlay from '../controls/LoadingOverlay';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../AsyncTracker';
import { Screen } from '../Root';
import PageSelector from '../controls/PageSelector';
import EmailConfirmationInfoBox from '../EmailConfirmationInfoBox';
import ReadReadinessInfoBox from './ReadReadinessInfoBox';
import { SharedState } from '../BrowserRoot';

interface Props {
	isBrowserCompatible: boolean,
	isExtensionInstalled: boolean | null,
	onGetHotTopics: FetchFunctionWithParams<{ pageNumber: number, pageSize: number }, HotTopics>,
	onInstallExtension: () => void,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onRegisterArticleChangeHandler: (handler: (article: UserArticle) => void) => Function,
	onRegisterUserChangeHandler: (handler: () => void) => Function,
	onResendConfirmationEmail: () => Promise<void>,
	onShareArticle: (article: UserArticle) => void,
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewComments: (article: UserArticle) => void,
	user: UserAccount | null
}
interface State {
	hotTopics: Fetchable<HotTopics>
}
class HomePage extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _loadPage = (pageNumber: number) => {
		this.setState({
			hotTopics: this.fetchHotTopics(pageNumber)
		});
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			hotTopics: this.fetchHotTopics(1)
		};
		this._asyncTracker.addCancellationDelegate(
			props.onRegisterArticleChangeHandler(updatedArticle => {
				updateArticles.call(this, updatedArticle);
			}),
			props.onRegisterUserChangeHandler(() => {
				this._asyncTracker.cancelAll();
				this._loadPage(1);
			})
		);
	}
	private fetchHotTopics(pageNumber: number) {
		return this.props.onGetHotTopics(
			{ pageNumber, pageSize: 40 },
			this._asyncTracker.addCallback(hotTopics => {
				this.setState({ hotTopics });
			})
		);
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<div className="home-screen_1sjipy">
				<EmailConfirmationInfoBox
					onResendConfirmationEmail={this.props.onResendConfirmationEmail}
					user={this.props.user}
				/>
				{this.props.user && this.props.isExtensionInstalled === false ?
					<ReadReadinessInfoBox
						isBrowserCompatible={this.props.isBrowserCompatible}
						onInstallExtension={this.props.onInstallExtension}
					/> :
					null}
				{this.state.hotTopics.isLoading ?
					<LoadingOverlay position="static" /> :
					<>
						<HotTopicsList
							aotd={this.state.hotTopics.value.aotd}
							articles={this.state.hotTopics.value.articles}
							isUserSignedIn={!!this.props.user}
							onReadArticle={this.props.onReadArticle}
							onShareArticle={this.props.onShareArticle}
							onToggleArticleStar={this.props.onToggleArticleStar}
							onViewComments={this.props.onViewComments}
						/>
						<PageSelector
							pageNumber={this.state.hotTopics.value.articles.pageNumber}
							pageCount={this.state.hotTopics.value.articles.pageCount}
							onChange={this._loadPage}
						/>
					</>}
			</div>
		);
	}
}
export default function <TScreenKey>(
	key: TScreenKey,
	deps: Pick<Props, Exclude<keyof Props, 'isExtensionInstalled' | 'user'>>
) {
	return {
		create: () => ({ key, title: 'Home' }),
		render: (screenState: Screen, sharedState: SharedState) => (
			<HomePage {
				...{
					...deps,
					isExtensionInstalled: sharedState.isExtensionInstalled,
					user: sharedState.user
				}}
			/>
		)
	};
}