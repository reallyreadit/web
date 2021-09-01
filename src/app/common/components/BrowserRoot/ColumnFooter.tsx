import * as React from 'react';
import { NavReference, NavOptions, NavMethod } from '../Root';
import Link, { Props as LinkProps } from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Icon from '../../../../common/components/Icon';
// import GetStartedButton from './GetStartedButton';
export default class extends React.PureComponent<{
	onNavTo: (ref: NavReference, options: NavOptions) => void,
	showWhatIsReadup: boolean
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
					this.props.showWhatIsReadup ?
						<Link key="home" screen={ScreenKey.Home} onClick={navTo}>What is Readup?</Link> :
						null,
					<Link key="faq" screen={ScreenKey.Faq} onClick={navTo}>FAQ</Link>,
					<Link key="blog" screen={ScreenKey.Blog} onClick={navTo}>Blog</Link>
				]
			},
			{
				title: "Download",
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
					<Link key="ios" href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={navTo}><Icon name='phone'/>iPhone and iPad</Link>,
					<Link key="mac" href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={navTo}><Icon name='apple'/>Mac</Link>,
					<Link key="windows" href="https://static.readup.com/downloads/windows/ReadupSetup.exe" onClick={navTo}><Icon name='windows'/>Windows</Link>,
					// <Link key="web-extensions" screen={ScreenKey.Download} onClick={navTo}><Icon name="internet" />Web Importer</Link>
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
										linkSet.sublinks
											.filter(
												link => !!link
											)
											.map(
												(link, i) => (
													<li key={link.key}>{link}</li>
												)
											)
									}
								</ul>
							</div>
						)}
					</div>
				</div>
				<div className="corp">
					<a href="mailto:support@readup.com">support@readup.com</a> · reallyread.it, inc., 309 Poe Ave, Toms River NJ 08753
				</div>
			</div>
		);
	}
}