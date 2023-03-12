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
import SelectList from '../../../../common/components/SelectList';

interface Props {
	pageNumber: number;
	pageCount: number;
	onChange: (pageNumber: number) => void;
	disabled?: boolean;
}
export default class PageSelector extends React.PureComponent<Props> {
	public static defaultProps: Pick<Props, 'disabled'> = {
		disabled: false,
	};
	private _updatePageNumber = (e: React.ChangeEvent<HTMLSelectElement>) =>
		this.props.onChange(parseInt(e.currentTarget.value));
	public render() {
		if (this.props.pageCount <= 1) {
			return null;
		}
		return (
			<form autoComplete="off" className="page-selector_a8tbpb">
				Page
				<SelectList
					disabled={this.props.disabled}
					onChange={this._updatePageNumber}
					options={Array.from(new Array(this.props.pageCount), (x, i) => ({
						key: i + 1,
					}))}
					value={this.props.pageNumber}
				/>
			</form>
		);
	}
}
