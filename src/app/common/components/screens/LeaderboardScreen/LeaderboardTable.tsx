import * as React from 'react';
import * as classNames from 'classnames';
import { formatCountable } from '../../../../../common/format';

interface Row {
	key: string | number,
	rank: number,
	name: React.ReactNode,
	score: number
}
export default (
	props: {
		overflowLimit?: number,
		rows: Row[],
		scoreUnit: string,
		scoreUnitPlural?: string
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
							<td>{row.score} {formatCountable(row.score, props.scoreUnit, props.scoreUnitPlural)}</td>
						</tr>
					)
				)}
			</tbody>
		</table>
	</div>
);