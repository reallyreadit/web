import * as React from 'react';
import Link from '../../../common/components/Link';
import RouteLocation from '../../../common/routing/RouteLocation';
import HomePanel from './BrowserRoot/HomePanel';
import {NavReference} from './Root';

type Props = {
	onNavTo: (ref: NavReference) => void
};

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
		paragraph: `Readup was built for reading, listening, and deep, independent thought. We aim to prevent what George Orwell warned us about, a world in which people lose their most human qualities and become soulless automatons without even realizing it. Reading keeps you anchored in reality. It has the power to change your life (it changed ours!) and we believe that it has the power to change the world.`
	}
]


// // Spring 2016		Bill's initial call to Jeff
// // Summer 2016		Initial extension experiments
// // Dec 21 2016		First git commit in reallyreadit/web
// // Feb    2017		NRKbeta initial launch
// // Mar 1  2017		Niemanlab article on NRKbeta
// // May 27 2017 	First user in database
// // Summer 2017		Beta test
// // Aug 10 2017		NRKbeta quiz article
// // Fall   2017		Matter application
// // Winter 2017-18	Matter begins
// // Summer 2018		Matter ends
// // Fall   2018		iOS app
// // Fall   2018		iOS app (Expo)
// // Winter 2018-19  iOS app (Native)
// // Spring 2019		Readup rebrand
// // Summer 2019		Lineage parser
// // Fall   2019     Notifications
// // Winter 2019-20  AppleID
// // Spring 2020     Twitter, Firefox
// // Summer 2020     Fundraising
// // Fall   2020     Blog embed, Dark mode, Safari, Edge
// // Winter 2020-21  Subscriptions
// const timeLinePoints = [
// 	{
// 		timeString: "2016",
// 		description: "Bill gets annoyed about the internet and calls Jeff to talk about an idea: People shouldn't be able to comment on articles and stories that they haven't actually read."
// 	},
// 	{
// 		timeString: "2017",
// 		description: "Bill and Jeff invent and release the world’s best read-tracking technology. Readers begin “voting with their attention.”"
// 	},
// 	{
// 		timeString: "2018",
// 		description: "The iOS app gets released in the fall and roughly doubles the size of the community overnight. "
// 	},
// 	{
// 		timeString: "2019",
// 		description: "reallyread.it becomes Readup. Bill and Jeff abandon all remnants of a “B2B” business plan. Instead, they decide to build the world’s best social media platform and reading app, a consumer business."
// 	},
// 	{
// 		timeString: "2020",
// 		description: "Early in the year, Readup fails to get into Y Combinator for the third time. After several failed attempts to fundraise, Bill and Jeff decide to make one last, big move: Start charging people for Readup."
// 	},
// 	{
// 		timeString: "2021",
// 		description: "Readup 2.0 is the world's first direct reader-writer marketplace, an ethical alternative to Facebook, Twitter and Reddit for people who want a healthier, more humane way to read. Readers pay to read on Readup and watch their money go to the writers. Journalists around the world rejoice. To be continued…"

// 	},
// ];

const missionPage = (props: Props ) => (
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
			{/* <HomePanel className="our-story-panel">
				<section className="our-story">
					<h2 className="heading-regular mission-title mission-title--our-story">Our story</h2>
					<p className="our-story__intro">Readup was invented and built by Bill Loundy and Jeff Camera, who met in pre-school and became lifelong friends. Bill and Jeff both love reading, technology and pizza.</p>
					<div className="our-story__timeline-card">
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
			*/}
			<HomePanel className="manifesto-link-panel">
				<Link
						className="manifesto-link"
						iconRight="arrow-right"
						href="https://blog.readup.com/2021/02/08/the-readup-manifesto.html"
						onClick={props.onNavTo}
						text="Read the manifesto"
					/>
			</HomePanel>

		</div>
);
export function createScreenFactory<TScreenKey>(key: TScreenKey, props: Props) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Mission' }),
		render: () => React.createElement(missionPage, props)
	};
}
export default missionPage;