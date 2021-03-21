import * as React from 'react';
import RouteLocation from '../../../common/routing/RouteLocation';
import HomePanel from './BrowserRoot/HomePanel';

const missionPoints : {title: string, paragraph: string}[] = [
	{
		title: "Reading is time well spent.",
		paragraph: `All screen time is not created equal. As we continue to spend more and more time on our devices, it is increasingly important for us to differentiate between screen activities that deplete us (aimlessly scrolling through feeds, for example) and those that enrich and inspire us. Reading thought-provoking articles from beginning to end is one of very few screen-based activities that is undeniably good for you and good for the world. Reading makes you happy and healthy; it stimulates the brain and nourishes the soul.`
	},
	{
		title: "Readup is humane technology.",
		paragraph: `The media, news and journalism industries are all in shambles, dominated by a few organizations that manipulate you into trading your time and attention for their profit. These organizations have an incentive to prevent you from focusing on one article at a time, let alone the actual article text, and they control an unprecedented share of the world’s attention. The Readup community is catalyzing a paradigm shift within the technology industry towards a set of practices and principles that truly respect people’s time, attention and privacy.`
	},
	{
		title: "Free-thinking is at stake.",
		paragraph: `Readup was built for reading, listening and thinking. It’s an engine of deep, critical, independent thought. George Orwell warned of a world in which people lose their most human qualities and become soulless automatons without even realizing it. We aim to prevent that from happening. Reading requires intention and discipline. That’s why it matters. Reading changes people. (It changed us!) And we believe that it has the power to change the world.`
	}
]

// Spring 2016		Bill's initial call to Jeff
// Summer 2016		Initial extension experiments
// Dec 21 2016		First git commit in reallyreadit/web
// Feb    2017		NRKbeta initial launch
// Mar 1  2017		Niemanlab article on NRKbeta
// May 27 2017 	First user in database
// Summer 2017		Beta test
// Aug 10 2017		NRKbeta quiz article
// Fall   2017		Matter application
// Winter 2017-18	Matter begins
// Summer 2018		Matter ends
// Fall   2018		iOS app
// Fall   2018		iOS app (Expo)
// Winter 2018-19  iOS app (Native)
// Spring 2019		Readup rebrand
// Summer 2019		Lineage parser
// Fall   2019     Notifications
// Winter 2019-20  AppleID
// Spring 2020     Twitter, Firefox
// Summer 2020     Fundraising
// Fall   2020     Blog embed, Dark mode, Safari, Edge
// Winter 2020-21  Subscriptions
const timeLinePoints = [
	{
		timeString: "Spring 2016",
		description: "Bill calls his lifelong friend Jeff to talk about an idea: People shouldn't be able to comment on articles and stories that they haven't actually read."
	},
	{
		timeString: "Winter 2016",
		description: "The first brick of the web app is laid."
	},
	{
		timeString: "Summer 2016",
		description: "Experiments start on the first browser extension."
	},
	{
		timeString: "May 2017",
		description: "The first Readers enter the reallyread.it database. Readup begins growing purely by word of mouth."
	},
	{
		timeString: "Summer 2017",
		description: "reallyread.it's first beta, a weekly article club, launches. Readers begin opting-in to share anonymized reading data in exchange for the fruits of that data: crowdsourced curation of the world’s best digital reading material. Readers begin “voting with their attention."
	},
	{
		timeString: "Summer 2018",
		description: <><a href="https://vimeo.com/276929332">Matter Demo Day</a>.</>
	},
	{
		timeString: "Fall 2018",
		description: "The iOS app is released."
	},
	{
		timeString: "Spring 2019",
		description: "reallyread.it becomes Readup."
	},
	{
		timeString: "Summer 2019",
		description: "Readup launches the Leaderboards. Scouting begins."
	},
	{
		timeString: "Fall 2019",
		description: "Notifications. Posting. Following. Reader Profiles. Article images."
	},
	{
		timeString: "Spring 2020",
		description: "Twitter integration. Firefox Add-on."
	},
	{
		timeString: "Summer 2020",
		description: "Bill and Jeff commit on a new plan for growth. The idea for an ethical method of monetization is born."
	},
	{
		timeString: "Fall 2020",
		description: "Dark Mode. Safari and Edge extensions."
	},
	{
		timeString: "Spring 2021",
		description: "Readup 2.0: Paid Readup. Subscriptions. Writer Profiles."
	},
];
const missionPage = () => (
		<div className="mission-page_hvneey">
			<HomePanel>
				<section className="mission-points">
					<h1 className="heading-regular mission-title">We're on a mission to fix digital reading.</h1>
					{missionPoints.map(({title, paragraph}) =>
						<div key={title} className="mission-point">
							<h2 className="heading-regular">{title}</h2>
							<p>{paragraph}</p>
						</div>)}
				</section>
			</HomePanel>
			<HomePanel className="our-story-panel">
				<section className="our-story">
					<h2 className="heading-regular mission-title mission-title--our-story">Our story</h2>
					<p className="our-story__intro">Readup started in 2016 when Bill and Jeff, two good friends who love reading, got frustrated with inability of social media companies to encourage deep reading and civilized conversation.</p>
					<div className="our-story__timeline-card">
						<table className="our-story__timeline">
							<tbody>
								{/* todo: this toString() might not be optimal */}
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
			<HomePanel className="manifesto-link-panel">
				<a className="heading-regular manifesto-link" href="https://blog.readup.com/2021/02/08/the-readup-manifesto.html">Read the manifesto →</a>
			</HomePanel>

		</div>
);
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Mission' }),
		render: () => React.createElement(missionPage)
	};
}
export default missionPage;