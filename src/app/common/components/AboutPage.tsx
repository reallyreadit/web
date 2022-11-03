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
// import Button from '../../../common/components/Button';
import Link, {DiscordInviteLink} from '../../../common/components/Link';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey from '../../../common/routing/ScreenKey';
import {NavOptions, NavReference} from './Root';
import HomeHero from './BrowserRoot/HomeHero';
import HomePanel from './BrowserRoot/HomePanel';
import Profile, {ProfileData} from './AboutPage/Profile';

interface Services {
	onCreateStaticContentUrl: (path: string) => string,
	onNavTo: (ref: NavReference, options?: NavOptions) => void,
}

const profiles: ProfileData[] = [
	{
		name: "Jeff Camera",
		title: "Readup Owner",
		readerName: "jeff",
		imageName: 'jeff.jpg',
		web: "https://jeffcamera.com"
	},
	{
		name: "Thor Galle",
		title: "Readup Maintainer",
		readerName: "thorgalle",
		imageName: 'thor.jpg',
		web: "https://thorgalle.me"
	}
];

const helper = {
	name: "Tarunika Ravichandran",
	readerName: "tarunika",
	link: "https://www.linkedin.com/in/tarunika-ravichandran-337a53119/"
};

const timeLinePoints = [
	{
		timeString: "2016",
		description: "Bill gets annoyed about the internet and calls Jeff with an idea: People shouldn't be able to comment on articles and stories that they haven't actually read. They start the company reallyread.it, inc."
	},
	{
		timeString: "2017",
		description: "Bill and Jeff invent reallyreadit's read-tracking technology. Readers begin voting with their attention to surface the best articles on the web."
	},
	{
		timeString: "2018",
		description: "The iOS app gets released in the fall and roughly doubles the size of the community overnight."
	},
	{
		timeString: "2019",
		description: "reallyread.it becomes Readup.com. Bill and Jeff abandon their initial B2B business plan. Instead, they focus on Readup's social reading features."
	},
	{
		timeString: "2020",
		description: "Early in the year, Readup fails to get into Y Combinator for the third time. Bill and Jeff decide to make one last, big move: Start charging people for Readup. Long-time reader Thor joins the team to help."
	},
	{
		timeString: "2021",
		description: "Readup launches a direct reader-writer marketplace, an ethical alternative to Facebook, Twitter and Reddit for people who want a healthier, more humane way to read. Readers pay to read on Readup and watch their money go to the writers they read."
	},
	{
		timeString: "2021",
		description: "Sad news. Readup's marketplace was unsuccessful and couldn't convince investors. This signifies the end of the company's runway. Bill, Jeff & Thor look for ways to let Readup's community and core product live on."
	},
	{
		timeString: "Spring 2022",
		description: "Rejoice! Readup.com is reborn as the open-source Readup Project, the free Readup Service, and the non-profit Readup Collective. The Collective maintains the Project, which is hosted by Jeff on Readup Service. Readers continue to read happily ever after!"
	}
];


const teamPage = (props: Services) => (
	<div className="about-page_irab6h">
		<HomePanel>
				<h2 className="heading-regular">About</h2>
				<p className="our-story__intro">Readup was invented and built by Bill Loundy and Jeff Camera, who met in pre-school and became lifelong friends.</p>
				<p className="our-story__intro">
				 Bill and Jeff both loved reading, but were  frustrated by how hard it was to actually read full articles on the web. Distractions abounded, and on top of that, people commented on articles without even reading them fully. They set out to create an app to fix this.
				</p>
				<p className="our-story__intro">Today, Readup.org is continued by a group of volunteers who came to love Readup over the years. They maintain and improve the platform, and let hundreds of people enjoy deep reading online.</p>
		</HomePanel>
		<HomeHero
			title="Meet the Team"
			description="Readup is 100% volunteer-owned and operated."
			className="meet-team-hero"
		/>
		<HomePanel
			className="meet-team">
			<div className="profiles">
				{profiles.map(profile => <Profile
					key={profile.readerName}
					data={profile}
					onCreateStaticContentUrl={props.onCreateStaticContentUrl}
					onNavTo={props.onNavTo}
				/>)}
			</div>
			<p className="special-thanks">Special thanks to {' '}<Link
					className="reader-link"
					screen={ScreenKey.Profile}
					params={{ 'userName': helper.readerName }}
					onClick={props.onNavTo}
				>@{helper.readerName}</Link> for the illustration on the homepage!
			</p>
		</HomePanel>
		<HomePanel className="our-story-panel">
			<section className="our-story">
				<h2 className="heading-regular title--our-story">Readup's History</h2>
				<div className="our-story__timeline-card ">
					<table className="our-story__timeline">
						<tbody>
							{timeLinePoints.map(tlP => <tr key={tlP.description.toString()}>
									<td>
										{tlP.timeString}
									</td>
									<td>
										{tlP.description}
									</td>
								</tr>)}
						</tbody>
					</table>
				</div>
			</section>
		</HomePanel>
		<HomeHero
			title="Join us!"
			className="join-us"
			description={<>Want to contribute? Let us know <DiscordInviteLink onClick={props.onNavTo}>on our Discord</DiscordInviteLink> what you want to do, <Link onClick={props.onNavTo} href="https://opencollective.com/readup-collective/contribute">contribute financially</Link>, or dive in the code <Link href="https://github.com/reallyreadit/dev-env" onClick={props.onNavTo}>on GitHub</Link>.</>}
		/>
	</div>
)

export default function createScreenFactory<TScreenKey>(key: TScreenKey, services: Services) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'About' }),
		render: () => React.createElement(teamPage, services)
	};
}