import * as React from 'react';

interface Props {
	item1: string,
	item2: string
}

export const ChartKey: React.SFC<Props> = props => (
	<ol className="chart-key_s05buv">
		<li>{props.item1}</li>
		<li>{props.item2}</li>
	</ol>
);