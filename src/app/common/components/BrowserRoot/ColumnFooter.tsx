// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import { NavReference, NavOptions, NavMethod } from '../Root';
import Link, {
	DiscordInviteLink,
	Props as LinkProps,
} from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Icon from '../../../../common/components/Icon';
import {
	CompatibleBrowser,
	DeviceType,
	getBrowserIconName,
	getStoreUrl,
} from '../../../../common/DeviceType';
import { SafariExtensionDialog } from './SafariExtensionDialog';
// import GetStartedButton from './GetStartedButton';
export default class extends React.PureComponent<{
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
	onOpenDialog: (dialog: React.ReactNode) => void;
	onCloseDialog: () => void;
	onCreateStaticContentUrl: (path: string) => string;
	showWhatIsReadup: boolean;
}> {
	public render() {
		const navTo = (ref: NavReference) =>
			this.props.onNavTo(ref, { method: NavMethod.ReplaceAll });
		const navToPush = (ref: NavReference) =>
			this.props.onNavTo(ref, { method: NavMethod.Push });

		interface LinkSet {
			title: string;
			sublinks: React.CElement<LinkProps, Link>[];
		}

		const links: LinkSet[] = [
			// TODO: can we import the slug from a single place?
			{
				title: 'Organization',
				sublinks: [
					<Link
						key="collective"
						href="https://opencollective.com/readup-collective"
						onClick={navTo}
					>
						Open Collective
					</Link>,
					<DiscordInviteLink key="contact" onClick={navTo}>
						Discord Community
					</DiscordInviteLink>,
					<Link key="privacy" screen={ScreenKey.PrivacyPolicy} onClick={navTo}>
						Privacy Policy
					</Link>,
				],
			},
			{
				title: 'Learn more',
				sublinks: [
					<Link key="about" screen={ScreenKey.About} onClick={navTo}>
						About
					</Link>,
					this.props.showWhatIsReadup ? (
						<Link key="home" screen={ScreenKey.Home} onClick={navTo}>
							What is Readup?
						</Link>
					) : null,
					<Link key="faq" screen={ScreenKey.Faq} onClick={navTo}>
						FAQ
					</Link>,
					<Link key="blog" href="https://blog.readup.org" onClick={navTo}>
						Blog
					</Link>,
				],
			},
			{
				title: 'Download',
				sublinks: [
					<Link
						key="ios"
						href="https://apps.apple.com/us/app/readup-social-reading/id1441825432"
						onClick={navToPush}
					>
						<Icon name='phone' />
						iPhone and iPad
					</Link>,
					...(
						[
							DeviceType.DesktopChrome,
							DeviceType.DesktopFirefox,
							DeviceType.DesktopEdge,
							DeviceType.DesktopSafari,
						] as CompatibleBrowser[]
					).map((browserDeviceType) => {
						let linkProps =
							browserDeviceType === DeviceType.DesktopSafari
								? {
										onClick: () => {
											this.props.onOpenDialog(
												<SafariExtensionDialog
													onClose={this.props.onCloseDialog}
													onCreateStaticContentUrl={
														this.props.onCreateStaticContentUrl
													}
													onNavTo={this.props.onNavTo}
												/>
											);
										},
								  }
								: {
										onClick: this.props.onNavTo,
										href: getStoreUrl(browserDeviceType),
								  };
						return (
							<Link key={browserDeviceType} {...linkProps}>
								<Icon name={getBrowserIconName(browserDeviceType)} />
								<span>{browserDeviceType}</span>
							</Link>
						);
					}),

					<Link
						key="desktop"
						screen={ScreenKey.Download}
						onClick={this.props.onNavTo}
					>
						<Icon name='arrow-down' />
						Desktop Apps
					</Link>,
				],
			},
		];
		return (
			<div className="column-footer_ltflpc" data-nosnippet>
				<div className="content">
					<div className="column-footer_ltflpc__links">
						<Link className="logo" screen={ScreenKey.Home} onClick={navTo} />
						{links.map((linkSet, i) => (
							<div
								className="column-footer_ltflpc__link-set"
								key={linkSet.toString() + i}
							>
								<span className="column-footer_ltflpc__link-set__title">
									{linkSet.title}
								</span>
								<ul>
									{linkSet.sublinks
										.filter((link) => !!link)
										.map((link, i) => (
											<li key={link.key}>{link}</li>
										))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
}
