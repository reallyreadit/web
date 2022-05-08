import * as React from 'react';
// import Button from '../../../common/components/Button';
import Link from '../../../common/components/Link';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey from '../../../common/routing/ScreenKey';
import {NavOptions, NavReference} from './Root';
import HomeHero from './BrowserRoot/HomeHero';
import HomePanel from './BrowserRoot/HomePanel';
import Profile, {ProfileData} from './TeamPage/Profile';

interface Services {
	onCreateStaticContentUrl: (path: string) => string,
	onNavTo: (ref: NavReference, options?: NavOptions) => void,
}

const profiles: ProfileData[] = [
	{
		name: "Bill Loundy",
		readerName: "bill",
		imageName: 'bill.png',
		web: "https://billloundy.com",
		mail: "bill@readup.com",
	},
	{
		name: "Jeff Camera",
		readerName: "jeff",
		imageName: 'jeff.jpg',
		web: "https://jeffcamera.com",
		mail: "jeff@readup.com"
	},
	{
		name: "Thor Galle",
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


const teamPage = (props: Services) => (
	<div className="team-page_a9b9l1">
		<HomeHero
			title="Meet the Team"
			description="Readup is 100% volunteer-owned and operated."
		/>
		<HomePanel>
			<h2 className="heading-regular">Leadership</h2>
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
		<HomeHero
			title="Join us!"
			description={<>Want to contribute? Email <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link></>}
		/>
	</div>
)

export default function createScreenFactory<TScreenKey>(key: TScreenKey, services: Services) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Meet the Team' }),
		render: () => React.createElement(teamPage, services)
	};
}