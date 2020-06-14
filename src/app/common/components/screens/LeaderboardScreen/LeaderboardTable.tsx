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