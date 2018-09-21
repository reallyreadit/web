import * as React from 'react';
import UserAccount from '../../../common/models/UserAccount';
import AppAuthScreen from './AppRoot/AppAuthScreen';
import Captcha from '../Captcha';
import AppHeader from './AppRoot/AppHeader';
import User from '../User';
import EventType from '../EventType';
import Toaster, { Toast, Intent } from './Toaster';
import Api from '../api/Api';
import EmailConfirmationBar from './EmailConfirmationBar';
import { IconName } from '../../../common/components/Icon';
import AppNav from './AppRoot/AppNav';
import Fetchable from '../api/Fetchable';
import HotTopics from '../../../common/models/HotTopics';
import UserArticle from '../../../common/models/UserArticle';
import PageResult from '../../../common/models/PageResult';
import HotTopicsPage from './HotTopicsPage';

interface Props {
	api: Api,
	captcha: Captcha,
	path: string,
	user: User
}
enum ScreenKey {
	Home = 'HOME',
	Starred = 'STARRED',
	History = 'HISTORY',
	Leaderboards = 'LEADERBOARDS'
}
interface Screen {
	articleLists?: { [key: string]: Fetchable<PageResult<UserArticle>> },
	articles?: { [key: string]: Fetchable<UserArticle> },
	key: ScreenKey,
	render: () => React.ReactNode,
	title?: string
}
const screenRoutes: {
	path: string,
	screenKey: ScreenKey
}[] = [{
	path: '/',
	screenKey: ScreenKey.Home
}]
const screenNavItems: {
	iconName: IconName,
	label: string,
	screenKey: ScreenKey
}[] = [{
		iconName: 'home',
		label: 'Home',
		screenKey: ScreenKey.Home
	}, {
		iconName: 'star',
		label: 'Starred',
		screenKey: ScreenKey.Starred
	}, {
		iconName: 'clock',
		label: 'History',
		screenKey: ScreenKey.History
	}, {
		iconName: 'line-chart',
		label: 'Stats',
		screenKey: ScreenKey.Leaderboards
}];
export default class extends React.Component<Props, {
	screens: Screen[],
	toasts: Toast[],
	user: UserAccount | null
}> {
	private readonly _addToast = (text: string, intent: Intent) => {
		const toast = {
			text,
			intent,
			timeoutHandle: window.setTimeout(() => {
				const toasts = this.state.toasts.slice();
				toasts[toasts.indexOf(toast)] = { ...toast, remove: true };
				this.setState({ toasts });
			}, 5000),
			remove: false
		};
		this.setState({ toasts: [...this.state.toasts, toast] });
	};
	private readonly _createAccount = (name: string, email: string, password: string, captchaResponse: string) => {
		return this.props.api
			.createUserAccount(name, email, password, captchaResponse)
			.then(userAccount => {
				this.setState({ user: userAccount });
				this.props.user.signIn(userAccount);
				this._addToast('Welcome to reallyread.it!\nPlease check your email and confirm your address.', Intent.Success);
				ga('send', {
					hitType: 'event',
					eventCategory: 'UserAccount',
					eventAction: 'create',
					eventLabel: userAccount.name
				});
			});
	};
	private readonly _popScreen = () => {
		this.setState({ screens: this.state.screens.slice(0, this.state.screens.length - 2) });
	};
	private readonly _readArticle = (article: UserArticle) => {

	};
	private readonly _removeToast = (timeoutHandle: number) => {
		this.setState({
			toasts: this.state.toasts.filter(toast => toast.timeoutHandle !== timeoutHandle)
		});
	};
	private readonly _viewComments = (article: UserArticle) => {

	};
	private readonly _screenCreatorMap: { [P in ScreenKey]: () => Screen } = {
		[ScreenKey.Home]: () => {
			function mapToGlobalState(hotTopics: Fetchable<HotTopics>) {
				return {
					articleLists: { articles: { ...hotTopics, value: hotTopics.value ? hotTopics.value.articles : null } },
					articles: { aotd: { ...hotTopics, value: hotTopics.value ? hotTopics.value.aotd : null } }
				};
			}
			const load = (pageNumber: number) => {
				return this.props.api.listHotTopics(
					pageNumber,
					hotTopics => this.setScreenState(
						ScreenKey.Home,
						mapToGlobalState(hotTopics)
					)
				);
			};
			const hotTopics = load(1);
			return {
				...mapToGlobalState(hotTopics),
				key: ScreenKey.Home,
				render: () => {
					const screen = this.getScreen(ScreenKey.Home);
					return (
						<HotTopicsPage
							aotd={screen.articles.aotd}
							articles={screen.articleLists.articles}
							isUserSignedIn={!!this.state.user}
							onReadArticle={this._readArticle}
							onReload={load}
							onShareArticle={this._shareArticle}
							onToggleArticleStar={this._toggleArticleStar}
							onViewComments={this._viewComments}
						/>
					);
				}
			};
		},
		[ScreenKey.Starred]: () => ({
			key: ScreenKey.Starred,
			render: () => {
				return <div></div>;
			}
		}),
		[ScreenKey.History]: () => ({
			key: ScreenKey.History,
			render: () => {
				return <div></div>;
			}
		}),
		[ScreenKey.Leaderboards]: () => ({
			key: ScreenKey.Leaderboards,
			render: () => {
				return <div></div>;
			}
		})
	};
	private readonly _shareArticle = (article: UserArticle) => {

	};
	private readonly _signIn = (email: string, password: string) => {
		return this.props.api
			.signIn(email, password)
			.then(userAccount => {
				this.setState({ user: userAccount });
				this.props.user.signIn(userAccount);
			});
	};
	private readonly _toggleArticleStar = (article: UserArticle) => {
		return (article.dateStarred ?
			this.props.api.unstarArticle :
			this.props.api.starArticle)(article.id);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			screens: [this.createScreen(props.path)],
			toasts: [],
			user: props.user.userAccount
		};
		props.user.addListener('authChange', ev => {
			if (ev.eventType === EventType.Sync) {
				this.setState({ user: ev.userAccount });
			}
		});
		props.user.addListener('update', ev => {
			if (ev.eventType === EventType.Sync) {
				this.setState({ user: ev.currUserAccount });
			}
		});
	}
	private createScreen(path: string) {
		return this._screenCreatorMap[screenRoutes.find(route => route.path === path).screenKey]();
	}
	private getScreen(key: ScreenKey) {
		return this.state.screens.find(screen => screen.key === key);
	}
	private setScreenState(key: ScreenKey, state: Partial<Screen>) {
		const
			screens = this.state.screens.slice(),
			screen = screens.find(screen => screen.key === key);
		screens.splice(screens.indexOf(screen), 1, { ...screen, ...state });
		this.setState({
			...this.state,
			screens
		});
	}
	public componentWillUnmount() {
		this.state.toasts.forEach(toast => window.clearTimeout(toast.timeoutHandle));
	}
	public render() {
		const
			navItems = screenNavItems
				.map(item => ({
					iconName: item.iconName,
					label: item.label,
					isSelected: this.state.screens[0].key === item.screenKey
				})),
			topScreen = this.state.screens[this.state.screens.length - 1];
		return (
			<div className="app-root">
				{this.state.user ?
					[
						<EmailConfirmationBar
							key="emailConfirmationBar"
							user={this.state.user}
						/>,
						<AppHeader
							key="appHeader"
							onBack={this._popScreen}
							title={topScreen.title}
						/>,
						<ol
							className="screens"
							key="screens"
						>
							{this.state.screens.map(screen => (
								<li key={screen.key}>
									{screen.render()}
								</li>
							))}
						</ol>,
						<AppNav
							items={navItems}
							key="nav"
						/>
					] :
					<AppAuthScreen
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