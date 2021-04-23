import * as React from 'react';
import { NavReference, NavOptions, NavMethod } from '../Root';
import Link, { Props as LinkProps } from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';
// import GetStartedButton from './GetStartedButton';
export default class extends React.PureComponent<{
	onNavTo: (ref: NavReference, options: NavOptions) => void
}> {
	public render() {
		const navTo = (ref: NavReference) => this.props.onNavTo(ref, { method: NavMethod.ReplaceAll });

		interface LinkSet {
			title: string,
			sublinks: React.CElement<LinkProps, Link>[]
		}

		const links:LinkSet[] = [
			// TODO: can we import the slug from a single place?
			{
				title: "Company",
				sublinks: [
					<Link key="mission" screen={ScreenKey.Mission} onClick={navTo}>Our Mission</Link>,
					<Link key="contact" href="mailto:support@readup.com" onClick={navTo}>Contact</Link>,
					<Link key="privacy" screen={ScreenKey.PrivacyPolicy} onClick={navTo}>Privacy Policy</Link>
				]
			},
			{
				title: "Learn more",
				sublinks: [
					<Link key="faq" screen={ScreenKey.Faq} onClick={navTo}>FAQ</Link>,
					<Link key="blog" href="https://blog.readup.com" onClick={navTo}>Blog</Link>
				]
			},
			{
				title: "Install Readup",
				sublinks: [
					// {
					// 	key: "ios_button",
					// 	component:
					// 		// TODO: copied from web/src/app/common/components/BrowserRoot/GetStartedButton.tsx
					// 		// extract as reusable component
					// 		// <a
					// 		// className="ios"
					// 		// href={getStoreUrl(DeviceType.Ios)}
					// 		// onClick={this._copyAppReferrerTextToClipboard}
					// 		// >
					// 		// 	<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
					// 		// </a>
					// 		// <GetStartedButton
					// 		// 	// TODO: is this a valid analytics action?
					// 		// 	analyticsAction="HomeScreenFooter"
					// 		// 	deviceType={this.props.deviceType}
					// 		// 	onBeginOnboarding={this.props.onBeginOnboarding}
					// 		// 	onCopyAppReferrerTextToClipboard={this.props.onCopyAppReferrerTextToClipboard}
					// 		// 	onOpenNewPlatformNotificationRequestDialog={this.props.onOpenNewPlatformNotificationRequestDialog}
					// 		// ></GetStartedButton>
					// },
					<Link key="ios" href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={navTo}>iPhone and iPad</Link>,
					<Link key="chrome" href="https://chrome.google.com/webstore/detail/readup/mkeiglkfdfamdjehidenkklibndmljfi?hl=en-US" onClick={navTo}>Chrome</Link>,
					<Link key="firefox" href="https://addons.mozilla.org/en-US/firefox/addon/readup/" onClick={navTo}>Firefox</Link>,
					<Link key="safari" href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={navTo}>Safari</Link>,
					<Link key="edge" href="https://microsoftedge.microsoft.com/addons/detail/readup/nnnlnihiejbbkikldbfeeefljhpplhcm" onClick={navTo}>Edge</Link>
				]
			},
		]
		return (
			<div
				className="column-footer_ltflpc"
				data-nosnippet
			>
				<div className="content">
					<div className="column-footer_ltflpc__links">
						<Link
							className="logo"
							screen={ScreenKey.Home}
							onClick={navTo}
						/>
						{links.map((linkSet, i) =>
							<div className="column-footer_ltflpc__link-set" key={linkSet.toString() + i}>
								<span className="column-footer_ltflpc__link-set__title">{linkSet.title}</span>
								<ul>
									{
										linkSet.sublinks.map(
											(link, i) => (
												<li key={link.key}>{link}</li>
											)
										)
									}
								</ul>
							</div>
						)}
					</div>

					{/* <div className="links">
						<a
							href="https://blog.readup.com/"
						>
							Blog
						</a>
						<Separator />
						<a
							href={findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()}
							onClick={this._viewPrivacyPolicy}
						>
							Privacy Policy
						</a>
						<Separator />
						<a href="mailto:support@readup.com">support@readup.com</a>
					</div>
					<StoreLinks />
					<div className="corp">
						reallyread.it, inc.<br />
						309 Poe Ave<br />
						Toms River NJ 08753
					</div> */}
				</div>
			</div>
		);
	}
}