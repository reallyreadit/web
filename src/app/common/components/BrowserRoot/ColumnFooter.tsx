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
import Link, { DiscordInviteLink, Props as LinkProps } from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';
import Icon from '../../../../common/components/Icon';
// import GetStartedButton from './GetStartedButton';
export default class extends React.PureComponent<{
	onNavTo: (ref: NavReference, options: NavOptions) => void,
	showWhatIsReadup: boolean
}> {
	public render() {
		const navTo = (ref: NavReference) => this.props.onNavTo(ref, { method: NavMethod.ReplaceAll });
		const navToPush = (ref: NavReference) => this.props.onNavTo(ref, { method: NavMethod.Push });

		interface LinkSet {
			title: string,
			sublinks: React.CElement<LinkProps, Link>[]
		}

		const links:LinkSet[] = [
			// TODO: can we import the slug from a single place?
			{
				title: "Company",
				sublinks: [
					<Link key="about" screen={ScreenKey.About} onClick={navTo}>About</Link>,
					<DiscordInviteLink key="contact" onClick={navTo}>Discord Community</DiscordInviteLink>,
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
					<Link key="blog" href="https://blog.readup.com" onClick={navTo} >Blog</Link>
				]
			},
			{
				title: "Download",
				sublinks: [
					<Link key="ios" href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={navToPush}><Icon name='phone'/>iPhone and iPad</Link>,
					<Link key="mac" href="https://apps.apple.com/us/app/readup-social-reading/id1441825432" onClick={navToPush}><Icon name='apple'/>Mac</Link>,
					<Link key="windows" href="https://static.readup.com/downloads/windows/ReadupSetup.exe" onClick={navToPush}><Icon name='windows'/>Windows</Link>,
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
			</div>
		);
	}
}