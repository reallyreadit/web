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
import classNames from 'classnames';
import AlertBadge from '../../../common/components/AlertBadge';

export interface Item {
	badge?: number,
	value: string
}
interface Props {
	disabled?: boolean,
	items: Item[],
	onChange: (value: string) => void,
	style?: 'auto' | 'compact' | 'extended'
	value: string
}
export default class HeaderSelector extends React.Component<Props> {
	public static defaultProps: Pick<Props, 'style'> = {
		style: 'auto'
	};
	private readonly _change = (event: React.MouseEvent<HTMLButtonElement>) => {
		this.props.onChange(event.currentTarget.value);
	};
	public render() {
		return (
			<div className={classNames('header-selector_9li9z5', this.props.style)}>
				{this.props.items.map(
					item => (
						<button
							className={classNames({ 'selected': this.props.value === item.value })}
							disabled={this.props.disabled}
							key={item.value}
							onClick={this._change}
							value={item.value}
						>
							{item.value}
							<AlertBadge count={item.badge} />
						</button>
					)
				)}
			</div>
		);
	}
}