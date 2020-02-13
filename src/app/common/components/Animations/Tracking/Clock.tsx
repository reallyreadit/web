import * as React from 'react';
import classNames from 'classnames';
import AnimationPlayState from '../AnimationPlayState';

export default (
	props: {
		playState: AnimationPlayState
	}
) => (
	<div className={classNames('clock_sgh5id', props.playState)}>
		<ol className="ticks">
			<li className="tick"></li>
			<li className="tick"></li>
			<li className="tick"></li>
			<li className="tick"></li>
			<li className="tick"></li>
			<li className="tick"></li>
		</ol>
		<ol className="hands">
			<li className="hand"></li>
			<li className="hand"></li>
		</ol>
	</div>
);