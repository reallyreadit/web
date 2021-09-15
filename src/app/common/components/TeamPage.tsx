import * as React from 'react';
import Button from '../../../common/components/Button';
import Link from '../../../common/components/Link';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey from '../../../common/routing/ScreenKey';
import {NavMethod, NavOptions, NavReference} from './Root';
import HomeHero from './BrowserRoot/HomeHero';
import HomePanel from './BrowserRoot/HomePanel';
import Profile, {ProfileData, SocialType} from './TeamPage/Profile';

interface Services {
	onCreateStaticContentUrl: (path: string) => string,
	onNavTo: (ref: NavReference, options?: NavOptions) => void,
}

const profiles: ProfileData[] = [
	{
		name: "Bill Loundy",
		readerName: "bill",
		role: "Chief Executive Officer",
		intro: <>Thor is our UX designer and developer from Europe. Bill introduced him to Readup, and he fell in love with it. He lives in Helsinki, Finland among lakes, trees and saunas.</>,
		imageName: 'bill.png',
		social: [
			{
				type: SocialType.Twitter,
				handle: "billloundy"
			},
			{
					type: SocialType.Web,
					handle: "https://billloundy.com"
			}
		],
		mail: "bill@readup.com",
	},
	{
		name: "Jeff Camera",
		readerName: "jeff",
		role: "Chief Technology Officer",
		intro: <>Thor is our UX designer and developer from Europe. Bill introduced him to Readup, and he fell in love with it. He lives in Helsinki, Finland among lakes, trees and saunas.</>,
		imageName: 'jeff.jpg',
		social: [
			{
				type: SocialType.Twitter,
				handle: "jeffcamera"
			},
			{
				type: SocialType.Web,
				handle: "https://jeffcamera.com"
			}
		],
		mail: "jeff@readup.com"
	},
	{
		name: "Thor Galle",
		readerName: "thorgalle",
		role: "Chief Growth Officer",
		intro: <>Thor encountered Readup in 2019. The app made him read, and he fell in love with it. Now he builds front-end improvements and researches how to make Readup even better for all. A European-at-large, Thor lives in Helsinki, Finland among lakes, trees and saunas.</>,
		imageName: 'thor.jpg',
		social: [
			{
				type: SocialType.Twitter,
				handle: "th0rgall"
			},
			{
				type: SocialType.LinkedIn,
				handle: "thorgalle"
			},
			{
				type: SocialType.Web,
				handle: "https://thorgalle.me"
			}
		],
		mail: "thor@readup.com"
	}
];

const helpers = [
	{
		name: "Tarunika Ravichandran",
		readerName: "tarunika",
		reason: "help with design",
		link: "https://www.linkedin.com/in/tarunika-ravichandran-337a53119/"
	},
	{
		name: "Adam Bartley",
		readerName: "bartadamley",
		reason: "help with marketing & growth",
		link: "https://bartadamley.com/"
	},
]

const teamPage = (props: Services) => (
	<div className="team-page_a9b9l1">
		<HomeHero
			title="Meet the team"
			description={"We're building Readup every day"}
		/>
		<HomePanel>
			{profiles.map(profile => <Profile
				key={profile.readerName}
				data={profile}
				onCreateStaticContentUrl={props.onCreateStaticContentUrl}
				onNavTo={props.onNavTo}
			/>)}
		</HomePanel>
		<HomeHero
			className="community-shoutout"
			title="🎉 Cheers to the community! ❤️"
			description="Readup wouldn’t be possible without our amazing community of nearly 5000 readers &amp; article scouts. They make every read count."
			actionButton={<Button
				size="x-large"
				text="Explore the community"
				intent="loud"
				align="center"
				onClick={() => props.onNavTo({key: ScreenKey.Leaderboards, params: {
					view: 'readers'
				}}, {method: NavMethod.ReplaceAll})}
			/>}
		/>
		<HomePanel>
			<p className="special-thanks"><em>Special thanks</em> to those community members who tinkered with us behind the scenes over the last years:{' '}
				{helpers.map((helper, i) => <span key={helper.readerName}><Link href={helper.link} onClick={props.onNavTo}>{helper.name}</Link> (<Link
					className="reader-link"
					screen={ScreenKey.Profile}
					params={{ 'userName': helper.readerName }}
					onClick={props.onNavTo}
				>@{helper.readerName}</Link>, for {helper.reason}){
				i === helpers.length - 2 ? ' & ' : i === helpers.length - 1 ? '' : ', '}</span>)}
			</p>
		</HomePanel>
		<HomeHero
			title="🙋‍♀️ Want to join the team?"
			description={<>We're happy to hear from you!<br/>Drop us an email at <Link href="mailto:support@readup.com" onClick={props.onNavTo}>support@readup.com</Link></>}
		/>
	</div>
)

export default function createScreenFactory<TScreenKey>(key: TScreenKey, services: Services) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Meet the Team' }),
		render: () => React.createElement(teamPage, services)
	};
}