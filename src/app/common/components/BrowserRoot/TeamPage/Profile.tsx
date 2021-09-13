import * as React from 'react';
import Icon, {IconName} from '../../../../../common/components/Icon';
import Link from '../../../../../common/components/Link';
import ScreenKey from '../../../../../common/routing/ScreenKey';
import {NavOptions, NavReference} from '../../Root';

export enum SocialType {
	Twitter,
	LinkedIn,
	Web
}

export interface ProfileData {
	name: string,
	readerName: string,
	role: string,
	intro: JSX.Element,
	imageName: string,
	social: {
		type: SocialType,
		handle: string
	}[],
	mail: string
}

function getSocialLink(type: SocialType, handle: string) {
	switch (type) {
		case SocialType.Twitter:
			return `https://twitter.com/${handle}`
		case SocialType.LinkedIn:
			return `https://linkedin.com/in/${handle}`
		case SocialType.Web:
			return handle;
	}
}

const socialIconMap: {[key in SocialType]: IconName}  = {
	[SocialType.Twitter]: 'twitter',
	// TODO
	[SocialType.LinkedIn]: 'linkedin',
	[SocialType.Web]: 'internet'
}

const profile = ({
	data: {name, readerName, role, intro, imageName, social, mail},
	onCreateStaticContentUrl,
	onNavTo
	}: {
		data: ProfileData,
		onCreateStaticContentUrl: (path: string) => string,
		onNavTo: (ref: NavReference, options?: NavOptions) => void,
	}) => (
	<div className="profile_m7zor">
			<span className="name">{name}</span>
			<span className="role">{role}</span>
		{/* <div className="title">
		</div> */}
		<img className="picture" src={onCreateStaticContentUrl(`/app/images/team-page/${imageName}`)} alt="My Impact illustration." />
		<div className="details">
			{/* <a href={`mailto:${mail}`}>{mail}</a> */}
			<Link
				className="mail"
				href={`mailto:${mail}`}
				onClick={onNavTo}
				iconLeft='envelope'
			>{mail}</Link>
			<div className="social">
				{social.map(account =>
					<a
						key={account.type}
						href={getSocialLink(account.type, account.handle)}
						target="_blank">
						<Icon name={socialIconMap[account.type]}></Icon>
					</a>
				)}
			</div>
		</div>
		<div className="intro">
			<div className="intro__text">{intro}</div>
			<Link
				className="reader-link"
				screen={ScreenKey.Profile}
				params={{ 'userName': readerName }}
				onClick={onNavTo}
				iconRight='arrow-right'
			>See what {name.split(' ')[0]} is reading</Link>
		</div>
	</div>
)

export default profile;