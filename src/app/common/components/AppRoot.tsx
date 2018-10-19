import * as React from 'react';
import AuthScreen from './AppRoot/AuthScreen';
import Header from './AppRoot/Header';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import NavTray from './AppRoot/NavTray';
import Root, { Screen, Props, State as RootState } from './Root';
import UserAccount from '../../../common/models/UserAccount';
import DialogManager from './DialogManager';
//import { clientTypeQueryStringKey } from '../../../common/routing/queryString';
import UserArticle from '../../../common/models/UserArticle';
import ScreenKey from '../../../common/routing/ScreenKey';
import routes from '../../../common/routing/routes';
import { findRouteByKey } from '../../../common/routing/Route';
import { createScreenFactory as createHomeScreenFactory } from './AppRoot/HomePage';
import classNames = require('classnames');
import Menu from './AppRoot/Menu';

interface State extends RootState {
	isPoppingScreen: boolean,
	menuState: 'opened' | 'closing' | 'closed',
}
export default class extends Root<Props, State> {
	// menu
	private readonly _closeMenu = () => {
		this.setState({ menuState: 'closing' });
	};
	private readonly _hideMenu = () => {
		this.setState({ menuState: 'closed' });
	};
	private readonly _openMenu = () => {
		this.setState({ menuState: 'opened' });
	};

	// screens
	private readonly _popScreen = () => {
		this.setState({ isPoppingScreen: true });
	};
	private readonly _handleScreenAnimationEnd = (ev: React.AnimationEvent) => {
		if (ev.animationName === 'app-root_vc3j5h-screen-slide-out') {
			this.setState({
				isPoppingScreen: false,
				screens: this.state.screens.slice(0, this.state.screens.length - 1)
			});
		}
	};
	private readonly _viewAdminPage = () => {
		this.replaceScreen(ScreenKey.AdminPage);
	};
	private readonly _viewHistory = () => {
		this.replaceScreen(ScreenKey.History);
	};
	private readonly _viewHome = () => {
		this.replaceScreen(ScreenKey.Home);
	};
	private readonly _viewInbox = () => {
		this.replaceScreen(ScreenKey.Inbox);
	};
	private readonly _viewLeaderboards = () => {
		this.replaceScreen(ScreenKey.Leaderboards);
	};
	private readonly _viewPrivacyPolicy = () => {
		this.replaceScreen(ScreenKey.PrivacyPolicy);
	};
	private readonly _viewSettings = () => {
		this.replaceScreen(ScreenKey.Settings);
	};
	private readonly _viewStarred = () => {
		this.replaceScreen(ScreenKey.Starred);
	};

	constructor(props: Props) {
		super(props);

		this._screenFactoryMap = {
			...this._screenFactoryMap,
			[ScreenKey.Home]: createHomeScreenFactory(ScreenKey.Home, {
				onGetHotTopics: this.props.serverApi.listHotTopics,
				onGetUser: this._getUser,
				onOpenMenu: this._openMenu,
				onReadArticle: this._readArticle,
				onSetScreenState: this._setScreenState,
				onShareArticle: this._shareArticle,
				onToggleArticleStar: this._toggleArticleStar,
				onViewComments: this._viewComments
			})
		};

		let
			dialog: React.ReactNode,
			screens: Screen[];
		if (props.initialUser) {
			const locationState = this.getLocationDependentState(props.initialLocation);
			dialog = locationState.dialog;
			screens = [locationState.screen];
		} else {
			dialog = null;
			screens = [];
		}
		this.state = {
			...this.state,
			dialog,
			isPoppingScreen: false,
			menuState: 'closed',
			screens
		};
	}
	private replaceScreen(key: ScreenKey) {
		const
			url = findRouteByKey(routes, key).createUrl(),
			[path, queryString] = url.split('?');
		this.setState({
			menuState: this.state.menuState === 'opened' ? 'closing' : 'closed',
			screens: [this._screenFactoryMap[key].create({ path, queryString })]
		});
	}
	protected onUserChanged(userAccount: UserAccount) {
		if (userAccount) {
			const locationState = this.getLocationDependentState({
				path: window.location.pathname,
				queryString: window.location.search
			});
			if (window.location.search) {
				this.clearQueryStringKvps();
			}
			this.setState({
				dialog: locationState.dialog,
				screens: [locationState.screen],
				user: userAccount
			});
		} else {
			this.setState({
				menuState: 'closed',
				screens: [],
				user: null
			});
		}
	}
	protected viewComments(article: UserArticle) {
		const
			[sourceSlug, articleSlug] = article.slug.split('_'),
			url = findRouteByKey(routes, ScreenKey.ArticleDetails).createUrl({
				['articleSlug']: articleSlug,
				['sourceSlug']: sourceSlug
			}),
			[path, queryString] = url.split('?');
		this.setState({
			screens: [
				...this.state.screens,
				{
					...this._screenFactoryMap[ScreenKey.ArticleDetails].create({ path, queryString }),
					title: article.title
				}
			]
		});
	}
	public componentDidMount() {
		//this.clearQueryStringKvps([clientTypeQueryStringKey]);
	}
	public render() {
		return (
			<div className="app-root_vc3j5h">
				{this.state.user ?
					<>
						<EmailConfirmationBar
							onResendConfirmationEmail={this._resendConfirmationEmail}
							user={this.state.user}
						/>
						<div className="content">
							<ol className="screens">
								{this.state.screens.map((screen, index, screens) => (
									<li
										className={classNames('screen', {
											'has-title': !!screen.title,
											'slide-out': this.state.isPoppingScreen && index === screens.length - 1
										})}
										key={screen.key}
										onAnimationEnd={this._handleScreenAnimationEnd}
									>
										{this._screenFactoryMap[screen.key].render(screen)}
									</li>
								))}
							</ol>
							{this.state.menuState !== 'closed' ?
								<Menu
									isClosing={this.state.menuState === 'closing'}
									onClose={this._closeMenu}
									onClosed={this._hideMenu}
									onSignOut={this._signOut}
									onViewAdminPage={this._viewAdminPage}
									onViewInbox={this._viewInbox}
									onViewPrivacyPolicy={this._viewPrivacyPolicy}
									onViewSettings={this._viewSettings}
									selectedScreenKey={this.state.screens[0].key}
									userAccount={this.state.user}
								/> :
								null}
						</div>
						<NavTray
							onViewHistory={this._viewHistory}
							onViewHome={this._viewHome}
							onViewLeaderboards={this._viewLeaderboards}
							onViewStarred={this._viewStarred}
							selectedScreenKey={this.state.screens[0].key}
						/>
						<Header
							isTransitioningBack={this.state.isPoppingScreen}
							onBack={this._popScreen}
							titles={this.state.screens.map(screen => screen.title)}
						/>
						<DialogManager dialog={this.state.dialog} />
					</> :
					<AuthScreen
						captcha={this.props.captcha}
						onCreateAccount={this._createAccount}
						onShowToast={this._addToast}
						onSignIn={this._signIn}
					/>}
				<Toaster
					onRemoveToast={this._removeToast}
					toasts={this.state.toasts}
				/>
			</div>
		);
	}
}