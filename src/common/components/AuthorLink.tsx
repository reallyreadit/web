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

const profileRoute = findRouteByKey(routes, ScreenKey.Author);
export default class AuthorLink extends React.Component<{
	className?: ClassValue;
	onCreateAbsoluteUrl: (path: string) => string;
	onViewAuthor: (slug: string, name: string) => void;
	name: string;
	slug: string;
}> {
	private readonly _viewAuthor = () => {
		this.props.onViewAuthor(this.props.slug, this.props.name);
	};
	public render() {
		return (
			<Link
				className={classNames('author-link_34t3vc', this.props.className)}
				href={this.props.onCreateAbsoluteUrl(
					profileRoute.createUrl({ slug: this.props.slug })
				)}
				onClick={this._viewAuthor}
				text={this.props.name}
			/>
		);
	}
}
