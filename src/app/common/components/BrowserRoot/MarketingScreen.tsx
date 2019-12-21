import * as React from 'react';
import Button from '../../../../common/components/Button';
import Popover, { MenuState, MenuPosition } from '../../../../common/components/Popover';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import AotdView from '../controls/articles/AotdView';
import Fetchable from '../../../../common/Fetchable';
import UserArticle from '../../../../common/models/UserArticle';
import UserAccount from '../../../../common/models/UserAccount';
import ShareData from '../../../../common/sharing/ShareData';
import ShareChannel from '../../../../common/sharing/ShareChannel';
import Rating from '../../../../common/models/Rating';
import LoadingOverlay from '../controls/LoadingOverlay';
import CommunityReads from '../../../../common/models/CommunityReads';
import Panel from './Panel';
import AppleDownloadButton from './AppleDownloadButton';

interface Props {
	communityReads: Fetchable<CommunityReads>,
	isDesktopDevice: boolean,
	isIosDevice: boolean | null,
	onCopyAppReferrerTextToClipboard: () => void,
	onCopyTextToClipboard: (text: string, successMessage: string) => void,
	onCreateAbsoluteUrl: (path: string) => string,
	onInstallExtension: () => void,
	onOpenCreateAccountDialog: () => void,
	onPostArticle: (article: UserArticle) => void,
	onRateArticle: (article: UserArticle, score: number) => Promise<Rating>,
	onReadArticle: (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => void,
	onShare: (data: ShareData) => ShareChannel[],
	onToggleArticleStar: (article: UserArticle) => Promise<void>,
	onViewAotdHistory: () => void,
	onViewComments: (article: UserArticle) => void,
	onViewPrivacyPolicy: () => void,
	onViewProfile: (userName: string) => void,
	user: UserAccount | null
	variant: number
}
export default class MarketingScreen extends React.Component<
	Props,
	{ menuState: MenuState }
> {
	private readonly _beginClosingMenu = () => {
		this.setState({ menuState: MenuState.Closing });
	};
	private readonly _closeMenu = () => {
		this.setState({ menuState: MenuState.Closed });
	};
	private readonly _openMenu = () => {
		this.setState({ menuState: MenuState.Opened });
	};
	private readonly _profileRoute = findRouteByKey(routes, ScreenKey.Profile);
	private readonly _viewBillsProfile = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		this._beginClosingMenu();
		this.props.onViewProfile('bill');
	};
	private readonly _viewJeffsProfile = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		this._beginClosingMenu();
		this.props.onViewProfile('jeff');
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			menuState: MenuState.Closed
		};
	}
	public render () {
		let button: React.ReactNode;
		if (this.props.isIosDevice) {
			button = (
				<AppleDownloadButton
					onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
				/>
			);
		} else if (this.props.isIosDevice === false) {
			button = (
				<Button
					size="x-large"
					intent="loud"
					text="Get Started"
					onClick={this.props.onOpenCreateAccountDialog}
				/>
			);
		}
		return (
			<div className="marketing-screen_n5a6wc">
				<Panel className="aotd">
					{this.props.communityReads.isLoading ?
						<LoadingOverlay position="static" /> :
						<AotdView
							aotd={this.props.communityReads.value.aotd}
							articles={this.props.communityReads.value.articles}
							isPaginated={false}
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
				</Panel>
				<Panel className="about">
					<h2>About</h2>
					<p>We're on a quest to reinvent social media. Other platforms have to maximize the numbers of ads you see, so they're addictive and distracting and they zap your attention span. Readup does the opposite. We obliterate ads and distractions and the overall result is an experience that feels slower, deeper, and profoundly more fulfilling.</p>
					<p className="bios">
						<a href="https://billloundy.com">Bill</a> and <a href="https://jeffcamera.com">Jeff</a> are the two humans behind Readup.&#32;
						<Popover
							menuChildren={
								<span className="links">
									<a
										href={this.props.onCreateAbsoluteUrl(this._profileRoute.createUrl({ 'userName': 'bill' }))}
										onClick={this._viewBillsProfile}
									>
										readup.com/@bill
									</a>
									<a
										href={this.props.onCreateAbsoluteUrl(this._profileRoute.createUrl({ 'userName': 'jeff' }))}
										onClick={this._viewJeffsProfile}
									>
										readup.com/@jeff
									</a>
								</span>
							}
							menuPosition={MenuPosition.TopCenter}
							menuState={this.state.menuState}
							onBeginClosing={this._beginClosingMenu}
							onClose={this._closeMenu}
							onOpen={this._openMenu}
						>
							Read with us!
						</Popover>
						&#32;And let us know what you think.
					</p>
					<div className="buttons">
						{button}
					</div>
				</Panel>
			</div>
		);
	}
}