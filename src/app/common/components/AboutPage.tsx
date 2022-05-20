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
		web: "https://jeffcamera.com",
		mail: "jeff@readup.com"
	},
	{
		name: "Thor Galle",
		title: "Readup Maintainer",
		readerName: "thorgalle",
		imageName: 'thor.jpg',
		web: "https://thorgalle.me",
		mail: "thorgalle+readup@gmail.com"
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
		description: "Bill gets annoyed about the internet and calls Jeff to talk about an idea: People shouldn't be able to comment on articles and stories that they haven't actually read. They found the company reallyread.it, inc."
	},
	{
		timeString: "2017",
		description: "Bill and Jeff invent and release reallyreadit's read-tracking technology. Readers begin voting with their attention to surface the best articles on the web."
	},
	{
		timeString: "2018",
		description: "The iOS app gets released in the fall and roughly doubles the size of the community overnight."
	},
	{
		timeString: "2019",
		description: "reallyread.it becomes Readup.com. Bill and Jeff abandon all remnants of a B2B business plan. Instead, they focus on Readup's social reading features."
	},
	{
		timeString: "2020",
		description: "Early in the year, Readup fails to get into Y Combinator for the third time. Bill and Jeff decide to make one last, big move: Start charging people for Readup. Long-time reader Thor joins the team."
	},
	{
		timeString: "2021",
		description: "Readup launches a direct reader-writer marketplace, an ethical alternative to Facebook, Twitter and Reddit for people who want a healthier, more humane way to read. Readers pay to read on Readup and watch their money go to the writers they read."
	},
	{
		timeString: "2021",
		description: "Sad news. Readup's marketplace was not successful, and couldn't convince investors. It means the end of reallyreadit, inc. Bill, Jeff & Thor look for ways to let Readup's community and core product live on."
	},
	{
		timeString: "Spring 2022",
		description: "Readup.com is reborn as the open-source Readup Project, the free Readup.org Service, and the non-profit Readup Collective. The Collective maintains the Project, which is hosted by Jeff on Readup.org Service. Readers continue to read happily!"
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
				<p className="our-story__intro">Today, Readup.org continued by a group of volunteers who came to love Readup over the years. They maintain and improve Readup, and let hundreds of people enjoy deep reading online.</p>
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
			description={<>Want to contribute? Let us know <DiscordInviteLink onClick={props.onNavTo}>on our Discord</DiscordInviteLink>.</>}
		/>
	</div>
)

export default function createScreenFactory<TScreenKey>(key: TScreenKey, services: Services) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'About' }),
		render: () => React.createElement(teamPage, services)
	};
}