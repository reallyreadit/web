import * as React from 'react';
// import Button from '../../../common/components/Button';
import Link from '../../../common/components/Link';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey from '../../../common/routing/ScreenKey';
import {NavOptions, NavReference} from './Root';
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
		intro: <>Bill is extremely passionate about reading and writing. He studied English literature at Stanford and has a decade of tech startup experience. Recently, Bill spent almost five years without a smartphone and without using any forms of social media. Now he is fully decided to building a more humane web. Bill lives in New Mexico.</>,
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
		intro: <>Jeff has been Bill's best friend since pre-school. Instead of going to college, Jeff taught himself how to code. Now he's a full-stack developer with over a decade of experience shipping web apps. In December 2016, he typed "git init" to create Readup's first repository and the rest is history. Jeff lives in New Jersey.</>,
		imageName: 'jeff.jpg',
		social: [
			{
				type: SocialType.Twitter,
				handle: "jeffrocams"
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
		intro: <>Thor is a designer and front-end developer. He first encountered Readup in 2019. The app turned Thor into a prolific reader and he quickly fell in love with the Readup community. Eventually, Thor became Readup's first hire and third co-founder. Thor lives in Helsinki, Finland.</>,
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
			description="We’re on a mission to fix the web for readers."
		/>
		<HomePanel>
			{profiles.map(profile => <Profile
				key={profile.readerName}
				data={profile}
				onCreateStaticContentUrl={props.onCreateStaticContentUrl}
				onNavTo={props.onNavTo}
			/>)}
			<p className="special-thanks">Special thanks to two extra-special volunteers:{' '}
				{helpers.map((helper, i) => <span key={helper.readerName}><Link href={helper.link} onClick={props.onNavTo}>{helper.name}</Link> (<Link
					className="reader-link"
					screen={ScreenKey.Profile}
					params={{ 'userName': helper.readerName }}
					onClick={props.onNavTo}
				>@{helper.readerName}</Link>, for {helper.reason}){
				i === helpers.length - 2 ? ' & ' : i === helpers.length - 1 ? '' : ', '}</span>)}
			</p>
		</HomePanel>
		{/* <HomeHero
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
		/> */}
		<HomeHero
			title="Want to join the team?"
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