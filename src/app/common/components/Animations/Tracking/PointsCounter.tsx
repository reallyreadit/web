import * as React from 'react';
import classNames from 'classnames';
import AnimationPlayState from '../AnimationPlayState';

function renderDigit() {
	return (
		<ol className="digit">
			{Array
				.from(new Array(11))
				.map(
					(_, index) => (
						<li
							className="number"
							key={index}
						>{index % 10}</li>
					)
				)}
		</ol>
	);
}
export default (
	props: {
		playState: AnimationPlayState
	}
) => (
	<div className={classNames('points-counter_bsm3lr', props.playState)}>
		{renderDigit()}
		{renderDigit()}
		{renderDigit()}
		{renderDigit()}
		<label>points</label>
	</div>
);