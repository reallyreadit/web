import * as React from 'react';
// import GetStartedButton from './GetStartedButton';
export default class extends React.PureComponent<{
		onCreateStaticContentUrl: (path: string) => string,
	onViewFaq: () => void,
	onViewHome: () => void,
	onViewMission: () => void,
	onViewPrivacyPolicy: () => void
}> {
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
	};
	public render() {

		interface Link  {
			text: string,
			slug: string,
			action(event: React.MouseEvent): void,
		}

		interface ComponentLink {
			component: JSX.Element,
			key: string
		}

		interface LinkSet {
			title: string,
			sublinks: (Link|ComponentLink)[]
		}

		const links:LinkSet[] = [
			// TODO: can we import the slug from a single place?
			{
				title: "Company",
				sublinks: [
					{
						text: "Our Mission",
						slug: 'mission',
						action: this.props.onViewMission
					},
					{
						key: "Contact",
						component: <a href="mailto:support@readup.com">Contact</a>
					},
					{
						text: "Privacy Policy",
						slug: 'privacy',
						action: this._viewPrivacyPolicy
					},
				]
			},
			{
				title: "Learn more",
				sublinks: [
					{
						text: "FAQ",
						slug: 'faq',
						action: this.props.onViewFaq
					},
					{
						key: "Blog",
						component: <a href="https://blog.readup.com/" target="_blank">Blog</a>
					},
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
					{
						key: 'iPhone and iPad',
						component: <a href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" target="_blank">iPhone and iPad</a>
					},
					{
						key: "Chrome",
						component: <a href="https://chrome.google.com/webstore/detail/readup/mkeiglkfdfamdjehidenkklibndmljfi?hl=en-US" target="_blank">Chrome</a>
					},
					{
						key: "Firefox",
						component: <a href="https://addons.mozilla.org/en-US/firefox/addon/readup/" target="_blank">Firefox</a>
					},
					{
						key: "Safari",
						component: <a href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" target="_blank">Safari</a>
					},
					{
						key: "Edge",
						component: <a href="https://microsoftedge.microsoft.com/addons/detail/readup/nnnlnihiejbbkikldbfeeefljhpplhcm" target="_blank">Edge</a>
					}
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
						<img className="logo" alt="Readup Logo" src={this.props.onCreateStaticContentUrl('/app/images/logo-white.svg')} onClick={this.props.onViewHome} />
						{links.map((linkSet, i) =>
							<div className="column-footer_ltflpc__link-set" key={linkSet.toString() + i}>
								<span className="column-footer_ltflpc__link-set__title">{linkSet.title}</span>
								<ul>
									{
										linkSet.sublinks.map(
											(link, i) =>
											{
												let simpleLink = link as Link;
												let componentLink = link as ComponentLink;
												if (simpleLink.text) {
													return <li key={simpleLink.text}><a href={`/${simpleLink.slug}`} onClick={(e) => {
														e.preventDefault();
														simpleLink.action(e);
													}}>{simpleLink.text}</a></li>
												} else if (componentLink.component) {
													return <li key={componentLink.key}>{componentLink.component}</li>
												} else {
													return null;
												}
											}).filter(e => e != null)
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