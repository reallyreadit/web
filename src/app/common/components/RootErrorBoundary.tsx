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
import ErrorBoundary from './ErrorBoundary';
import InfoBox from '../../../common/components/InfoBox';
import Link, { DiscordInviteLink } from '../../../common/components/Link';

interface Props {
	children: React.ReactNode;
	onNavTo: (url: string) => void;
	onReloadWindow: () => void;
}
export default class RootErrorBoundary extends React.PureComponent<
	Props,
	{ isReloading: boolean }
> {
	private readonly _reload = () => {
		this.setState({ isReloading: true });
		this.props.onReloadWindow();
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			isReloading: false,
		};
	}
	public render() {
		return (
			<ErrorBoundary
				errorElement={
					<InfoBox position="absolute" style="warning">
						<p>An error occurred and caused the app to crash.</p>
						<p>
							If this keeps happening please{' '}
							<DiscordInviteLink onClick={this.props.onNavTo}>
								let us know in Discord.
							</DiscordInviteLink>
						</p>
						<p>
							<Link
								iconLeft="refresh2"
								onClick={this._reload}
								state={this.state.isReloading ? 'busy' : 'normal'}
								text={this.state.isReloading ? 'Reloading' : 'Reload App'}
							/>
						</p>
					</InfoBox>
				}
			>
				{this.props.children}
			</ErrorBoundary>
		);
	}
}
