import * as React from 'react';
import AppAuthScreen from './AppRoot/AppAuthScreen';
import AppHeader from './AppRoot/AppHeader';
import Toaster from './Toaster';
import EmailConfirmationBar from './EmailConfirmationBar';
import AppNav from './AppRoot/AppNav';
import Root, { Props as RootProps } from './Root';

export default class extends Root {
	constructor(props: RootProps) {
		super(props);
		this.state = {
			screens: props.user ?
				[this.createScreen(props.path)] :
				[],
			toasts: [],
			user: props.user
		};
	}
	public render() {
		const title = this.state.screens.length ?
			this.state.screens[this.state.screens.length - 1].title :
			null;
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
							title={title}
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
							items={this.getNavItems()}
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