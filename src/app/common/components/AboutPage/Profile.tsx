// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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
	title: string,
	readerName: string,
	imageName: string,
	web: string,
	mail: string
}

const profile = ({
	data: {name, readerName, imageName, web, title},
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
			<span>{title}</span>
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