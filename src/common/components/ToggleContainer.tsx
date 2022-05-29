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
import * as classNames from 'classnames';

type Props = (
		{
			isHidden: boolean
		} | {
			isVisible: boolean
		}
	) & {
		unmount: boolean
	};
export default class ToggleContainer extends React.PureComponent<Props> {
	public render() {
		let isEnabled: boolean;
		if ('isHidden' in this.props) {
			isEnabled = !this.props.isHidden;
		} else {
			isEnabled = this.props.isVisible;
		}
		return (
			<div
				className={
					classNames(
						'toggle-container_3u7fd7',
						{
							'hidden': !this.props.unmount && !isEnabled
						}
					)
				}
			>
				{!this.props.unmount || isEnabled ?
					this.props.children :
					null}
			</div>
		);
	}
}