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
import Separator from '../../../../common/components/Separator';
import { findRouteByKey } from '../../../../common/routing/Route';
import routes from '../../../../common/routing/routes';
import ScreenKey from '../../../../common/routing/ScreenKey';
import StoreLinks from '../StoreLinks';

export default class extends React.PureComponent<{
	onViewPrivacyPolicy: () => void
}> {
	private readonly _viewPrivacyPolicy = (ev: React.MouseEvent<HTMLAnchorElement>) => {
		ev.preventDefault();
		this.props.onViewPrivacyPolicy();
	};
	public render() {
		return (
			<div
				className="footer_ink40x"
				data-nosnippet
			>
				<div className="links">
					<a
						href="https://blog.readup.com/"
					>
						Blog
					</a>
					<Separator />
					<a
						href={findRouteByKey(routes, ScreenKey.PrivacyPolicy).createUrl()}
						onClick={this._viewPrivacyPolicy}
					>
						Privacy Policy
					</a>
					<Separator />
				</div>
				<StoreLinks />
			</div>
		);
	}
}