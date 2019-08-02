import * as React from 'react';
import BrowserActionState from '../../common/BrowserActionState';
import ArticleDetails from '../../../common/components/ArticleDetails';
import ScreenKey from '../../../common/routing/ScreenKey';
import routes from '../../../common/routing/routes';
import { findRouteByKey } from '../../../common/routing/Route';
import DialogKey from '../../../common/routing/DialogKey';
import UserArticle from '../../../common/models/UserArticle';
import Toaster, { Toast } from '../../../common/components/Toaster';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import ClipboardTextInput from '../../../common/components/ClipboardTextInput';
import AsyncTracker from '../../../common/AsyncTracker';
import ShareChannel from '../../../common/sharing/ShareChannel';
import ClipboardService from '../../../common/services/ClipboardService';
import { createUrl } from '../../../common/HttpEndpoint';
import Button from '../../../common/components/Button';
import { createQueryString } from '../../../common/routing/queryString';

export type Props = BrowserActionState & {
	onAckNewReply: () => void,
	onActivateReaderMode: () => void,
	onDeactivateReaderMode: () => void,
	onToggleContentIdentificationDisplay: () => void,
	onToggleReadStateDisplay: () => void,
	onToggleStar: () => Promise<void>
};
export default class extends React.Component<
	Props,
	{ toasts: Toast[] }
> {
	private _openInNewTab = (path: string) => window.open(this._createAbsoluteUrl(path), '_blank');
	private _showSignInDialog = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Home, DialogKey.SignIn).createUrl());
	private _showCreateAccountDialog = () => this._openInNewTab(findRouteByKey(routes, ScreenKey.Home, DialogKey.CreateAccount).createUrl());
	private _goToInbox = () => {
		if (this.props.showNewReplyIndicator) {
			this.props.onAckNewReply();
		}
		this._openInNewTab(findRouteByKey(routes, ScreenKey.Inbox).createUrl());
	};
	private _goToComments = () => {
		this._openInNewTab(findRouteByKey(routes, ScreenKey.Comments).createUrl(this.getArticleUrlParams()));
	};
	private readonly _toggleReaderMode = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			this.props.onActivateReaderMode();
		} else {
			this.props.onDeactivateReaderMode();
		}
	};
	private _toggleStar = () => {
		return this.props.onToggleStar();
	};
	private _preventDefault = (article: UserArticle, e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
	};

	// clipboard
	private readonly _clipboard = new ClipboardService(
		(content, intent) => {
			this._toaster.addToast(content, intent);
		}
	);

	// routing
	private readonly _createAbsoluteUrl = (path: string) => createUrl(window.reallyreadit.extension.config.web, path);

	// sharing
	private readonly _handleShareRequest = () => {
		return [
			ShareChannel.Clipboard,
			ShareChannel.Email,
			ShareChannel.Twitter
		];
	};

	// toasts
	private readonly _toaster = new ToasterService({
		asyncTracker: new AsyncTracker(),
		setState: (state: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
			this.setState(state);
		}
	});

	constructor(props: Props) {
		super(props);
		this.state = {
			toasts: []
		};
	}
	private getArticleUrlParams()  {
		const [sourceSlug, articleSlug] = this.props.article.slug.split('_');
		return {
			['articleSlug']: articleSlug,
			['sourceSlug']: sourceSlug
		};
	}
	public render() {
		return (
			<div className="app_79z645">
				<header>
					<a
						href={this._createAbsoluteUrl('/')}
						target="_blank"
					>
						<img
							alt="logo"
							src="./images/logo.svg"
						/>
					</a>
					{this.props.showNewReplyIndicator ?
						<Button
							text="Inbox"
							iconLeft="box"
							onClick={this._goToInbox}
							showIndicator
						/> :
						null}
				</header>
				{!this.props.isAuthenticated ?
					<div className="unauthenticated">
						<div className="signed-out-warning">
							<img
								alt="logo"
								src="./images/warning-triangle.svg"
							/>
							<span>Log in or sign up to get started.</span>
						</div>
						<div className="buttons">
							<Button
								text="Log In"
								onClick={this._showSignInDialog}
							/>
							<Button
								text="Sign Up"
								onClick={this._showCreateAccountDialog}
								style="preferred"
							/>
						</div>
					</div> :
					this.props.activeTab && this.props.article ?
						<>
							<div className="controls">
								<label className="reader-toggle">
									<span className="text">Reader Mode</span>
									<span className="toggle-switch">
										<input
											type="checkbox"
											checked={this.props.activeTab.isReaderModeActivated}
											onChange={this._toggleReaderMode}
										/>
										<span className="switch"></span>
									</span>
								</label>
							</div>
							<ArticleDetails
								article={this.props.article}
								imagePath='./images'
								isUserSignedIn={true}
								onCopyTextToClipboard={this._clipboard.copyText}
								onCreateAbsoluteUrl={this._createAbsoluteUrl}
								onRead={this._preventDefault}
								onShare={this._handleShareRequest}
								onToggleStar={this._toggleStar}
								onViewComments={this._goToComments}
								useAbsoluteUrls
							/>
							{this.props.debug ?
								<ul className="debug">
									<li>
										<button onClick={this.props.onToggleContentIdentificationDisplay}>Toggle Content Identification Display</button>
									</li>
									<li>
										<button onClick={this.props.onToggleReadStateDisplay}>Toggle Read State Display</button>
									</li>
								</ul> :
								null}
						</> :
						<>
							<div className="tip">Open this pop-up when you're reading an article to view your progress or star it for later.</div>
							{!this.props.isOnHomePage ?
								<div className="no-article">
									<div className="notice">No article detected on this web page.</div>
									<div className="report">Is this a mistake? Please <a href={'mailto:support@readup.com' + createQueryString({ subject: 'Extension issue: Article not detected', body: this.props.url })} target="_blank">let us know.</a></div>
								</div> :
								null}
						</>}
				<Toaster
					onRemoveToast={this._toaster.removeToast}
					toasts={this.state.toasts}
				/>
				<ClipboardTextInput onSetRef={this._clipboard.setTextInputRef} />
			</div>
		);
	}
}