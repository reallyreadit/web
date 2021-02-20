import * as React from 'react';
// import Separator from '../../../../common/components/Separator';
// import { findRouteByKey } from '../../../../common/routing/Route';
// import routes from '../../../../common/routing/routes';
// import ScreenKey from '../../../../common/routing/ScreenKey';
// import StoreLinks from '../StoreLinks';

export default class extends React.PureComponent<{
	onViewPrivacyPolicy: () => void
}> {
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
	};
	public render() {

		interface Link  {
			text: string,
			action?(event: React.MouseEvent): void
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
			{
				title: "Company",
				sublinks: [
					{
						text: "Our Mission",
					},
					{
						text: "Contact"
					},
					{
						text: "Privacy Policy",
						action: this._viewPrivacyPolicy
					},
				]
			},
			{
				title: "Learn more",
				sublinks: [
					{
						text: "FAQ",
					},
					{
						text: "Article readings in Clubhouse"
					},
					{
						text: "Blog"
					},
				]
			},
			{
				title: "Install Readup",
				sublinks: [
					{
						// TODO: copied from web/src/app/common/components/BrowserRoot/GetStartedButton.tsx
						// extract as reusable component
						key: "ios_button",
						component: 	
							<a
							className="ios"
							// href={getStoreUrl(DeviceType.Ios)}
							// onClick={this._copyAppReferrerTextToClipboard}
							>
								<img src="/images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg" alt="App Store Badge" />
							</a> 
					},
					{
						text: "Chrome"
					},
					{
						text: "Firefox"
					},
					{
						text: "Edge"
					},
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
						<img className="logo" alt="Readup Logo" src={`/images/logo-white.svg`} />
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
													return <li><a key={simpleLink.text}>{simpleLink.text}</a></li>
												} else if (componentLink.component) {
													return <li key={componentLink.key}>{componentLink.component}</li>
												} else {
													return null;
												}
											})
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