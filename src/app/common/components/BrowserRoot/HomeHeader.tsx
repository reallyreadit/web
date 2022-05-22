import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../common/components/Icon';
import ScreenKey from '../../../../common/routing/ScreenKey';
import routes from '../../../../common/routing/routes';
import { findRouteByKey } from '../../../../common/routing/Route';
import Button from '../../../../common/components/Button';
import { NavMethod, NavOptions, NavReference, Screen }  from '../../../common/components/Root'
// import GetStartedButton from './GetStartedButton';
import Link from '../../../../common/components/Link';

interface Props {
	currentScreen: Screen,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
	onViewHome: () => void
}

type State = {
	menuOpen: boolean
}

// const analyticsAction = 'Header';

export default class HomeHeader extends React.PureComponent<Props, State> {
	state: State = {
		menuOpen: false,
	}

	private readonly _handleLogoClick = (e: React.MouseEvent) => {
		this.props.onViewHome();
	};

	private _toggleMenu() {
		this.setState((prevState) => ({menuOpen: !prevState.menuOpen}));
	};

	// capture the page navigation and close the mobile menu
	private pageNavigation(navFunction: (e: React.MouseEvent) => void, event?: React.MouseEvent) {
		// prevent default navigation synchronously
		event?.preventDefault();
		this.setState({menuOpen: false}, () => {
			// perform navigation asynchrounsly
			navFunction(event);
		});
	};

	constructor(props: Props) {
		super(props);
	}

	public render() {
		const menuLinks = [
				// TODO: this causes the app to crash due to this.state.blogPosts.value is undefined
				// maybe the URL format is unexpected?
				// {
				// 	screenKey: ScreenKey.Home,
				// 	linkText: 'How it works',
				// 	navFunction: () => { window.location.href = "/#how-it-works" }
				// },
				{
					screenKey: ScreenKey.About,
					linkText: 'About',
				},
				{
					screenKey: ScreenKey.Faq,
					linkText: 'FAQ',
				}
			];

		return (
			<header className="home-header_2afwll responsive">
				<div className="menu-controls-container">
					<a
						className="logo"
						href={findRouteByKey(routes, ScreenKey.Home).createUrl()}
						onClick={(event) => this.pageNavigation(this._handleLogoClick, event)}
					>
					</a>
					<Icon
						className="mobile-menu-toggle"
						name={ this.state.menuOpen ? "cross" : "menu" }
						onClick={this._toggleMenu.bind(this)}
					/>
				</div>
				<div className={
					classNames(
						"menu-container",
						{ open: this.state.menuOpen }
					)}>
					<>
						{menuLinks.map(link =>
							<Link
								key={link.linkText}
								screen={link.screenKey}
								className={(this.props.currentScreen && this.props.currentScreen.key) === link.screenKey ? 'active' : ''}
								onClick={(navRef: NavReference) => this.pageNavigation(this.props.onNavTo.bind(this, navRef))}
							>
								{link.linkText}
							</Link>)
						}
						<Button
							text="Download App"
							size="large"
							intent="loud"
							onClick={(ev) => this.pageNavigation(() => this.props.onNavTo({ key: ScreenKey.Download }, { method: NavMethod.ReplaceAll }), ev)}
						/>
					</>
				</div>
			</header>
		);
	}
}