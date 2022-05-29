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

interface Row {
	key: string | number,
	rank: number,
	name: React.ReactNode,
	score: string
}
export default (
	props: {
		overflowLimit?: number,
		rows: Row[]
	}
) => (
	<div
		className={
			classNames(
				'leaderboard-table_2664hr',
				{
					'fixed-height': props.overflowLimit != null,
					'overflowing': props.overflowLimit != null && props.rows.length > props.overflowLimit
				}
			)
		}
	>
		<table>
			<tbody>
				{props.rows.map(
					row => (
						<tr key={row.key}>
							<td>{row.rank}</td>
							<td>
								<span className="cell-liner">
									<span className="overflow-container">{row.name}</span>
								</span>
							</td>
							<td>{row.score}</td>
						</tr>
					)
				)}
			</tbody>
		</table>
	</div>
);