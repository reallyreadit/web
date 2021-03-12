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
const missionPage = () => (
	<ScreenContainer>
		<div className="mission-page_hvneey">
			{missionPoints.map(({title, paragraph}) =>
				<div key={title} className="mission-point">
					<h2 className="heading-regular">{title}</h2>	
					<p>{paragraph}</p>
				</div>)}
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