import * as React from 'react';
import Link from '../../../../common/components/Link';
import ScreenKey from '../../../../common/routing/ScreenKey';
import {NavOptions, NavReference} from '../Root';

export enum SocialType {
	Twitter,
	LinkedIn,
	Web
}

export interface ProfileData {
	name: string,
	readerName: string,
	imageName: string,
	web: string,
	mail: string
}

const profile = ({
	data: {name, readerName, imageName, web, mail},
	onCreateStaticContentUrl,
	onNavTo
	}: {
		data: ProfileData,
		onCreateStaticContentUrl: (path: string) => string,
		onNavTo: (ref: NavReference, options?: NavOptions) => void,
	}) => (
	<div className="profile_m7zor">
		<img className="picture" src={onCreateStaticContentUrl(`/app/images/team-page/${imageName}`)} alt={`${name}'s profile picture`} />
		<div className="details">
			<span className="name">{name}</span>
			<div>
				Reader name: <Link
					className="reader-link"
					screen={ScreenKey.Profile}
					params={{ 'userName': readerName }}
					onClick={onNavTo}
				>{readerName}</Link>
			</div>
			<Link
				text={web.replace("https://", "")}
				href={web}
				onClick={onNavTo}>
				{/* <Icon name="internet"></Icon> */}
			</Link>
		</div>
	</div>
)

export default profile;