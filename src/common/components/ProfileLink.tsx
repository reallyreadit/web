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
import Link from './Link';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import { findRouteByKey } from '../routing/Route';
import routes from '../routing/routes';
import ScreenKey from '../routing/ScreenKey';

const profileRoute = findRouteByKey(routes, ScreenKey.Profile);
export default class ProfileLink extends React.Component<{
	className?: ClassValue,
	onCreateAbsoluteUrl: (path: string) => string,
	onViewProfile: (userName: string) => void,
	userName: string
}> {
	private readonly _viewProfile = () => {
		this.props.onViewProfile(this.props.userName);
	};
	public render() {
		return (
			<Link
				className={classNames('profile-link_7fs028', this.props.className)}
				href={this.props.onCreateAbsoluteUrl(
					profileRoute.createUrl({ 'userName': this.props.userName })
				)}
				onClick={this._viewProfile}
				text={this.props.userName}
			/>
		);
	}
}