import * as React from 'react';
import ScreenContainer from './ScreenContainer';
import RouteLocation from '../../../common/routing/RouteLocation';

const missionPoints : {title: string, paragraph: string}[] = [
	{
		title: "Reading is time well spent.",
		paragraph: `All screen time is not created equal. As we continue to spend more and more time \
		 on our devices, it is increasingly important for us to differentiate between screen activities \
		 that deplete us (aimlessly scrolling through feeds, for example) and those that enrich and inspire us.\
		 Reading thought-provoking articles from beginning to end is one of very few screen-based activities that \
		  is undeniably good for you and good for the world. (One more sentence about the positive benefits/virtues of reading.)`
	},
	{
		title: "Readup is humane technology.",
		paragraph: `The media, news and journalism industries are all in shambles, dominated by a few organizations \
			that manipulate you into trading your time and attention for their profit. These organizations have an incentive \
			to prevent you from focusing on one article at a time, let alone the actual article text. The Readup community is \
			catalyzing a paradigm shift within the technology industry towards a set of practices and principles that truly respect people’s time, \
			attention and privacy.`
	},
	{
		title: "Free-thinking is at stake.",
		paragraph: `George Orwell warned of a world in which people lose their most human qualities and become soulless \
			automatons without even realizing it. As fewer companies continue to control a larger share of the world’s \
			time and attention, we inch closer to that reality. Readup is an engine of deep, critical, independent \
			thought. Reading changes people. And we believe that it has the power to change the world.
			`
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
		description: "Bill calls Jeff. The idea is born."
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
		description: "The first user is able to log in."
	},
	{
		timeString: "Summer 2017",
		description: "Readup starts in beta."
	},
	{
		timeString: "Fall 2017",
		description: <>Readup  <a href="https://www.matter.vc/"> Matter</a>.</>
	},
	{
		timeString: "Winter 2017",
		description: "Matter begins."
	},
	{
		timeString: "Summer 2018",
		description: "Matter ends."
	},
	{
		timeString: "Fall 2018",
		description: "The iOS app is released."
	},
	{
		timeString: "Spring 2019",
		description: "Readup gets a visual overhaul."
	},
	{
		timeString: "Summer 2020",
		description: "Readup starts fundraising."
	},
	{
		timeString: "Fall 2020",
		description: "Readup adds features: Safari & Edge support, dark mode."
	},
];
const missionPage = () => (
		<ScreenContainer>
			<div className="mission-page_hvneey">
				<section className="mission-points">
					<h1 className="heading-regular mission-title">We're on a mission to fix digital reading.</h1>
					{missionPoints.map(({title, paragraph}) =>
						<div key={title} className="mission-point">
							<h2 className="heading-regular">{title}</h2>
							<p>{paragraph}</p>
						</div>)}
				</section>
				<section className="our-story">
					<h2 className="heading-regular mission-title mission-title--our-story">Our story</h2>
					<p className="our-story__intro">Readup started in 2016 when Bill and Jeff, two good friends who love reading, got frustrated with inability of social media companies to encourage deep reading and civilized conversation.</p>
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
				</section>
				<a className="heading-regular manifesto-link" href="https://blog.readup.com/2021/02/08/the-readup-manifesto.html">Read the manifesto →</a>
		</div>
	</ScreenContainer>
);
export function createScreenFactory<TScreenKey>(key: TScreenKey) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Mission' }),
		render: () => React.createElement(missionPage)
	};
}
export default missionPage;