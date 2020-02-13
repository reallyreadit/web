import * as React from 'react';
import classNames from 'classnames';
import AnimationPlayState from '../AnimationPlayState';

export default (
	props: {
		playState: AnimationPlayState,
		position: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
	}
) => (
	<div
		className={
			classNames(
				'cat_tpgfsr',
				props.playState,
				`n-${props.position}`
				)
			}
		>
		<div className="head"></div>
		<div className="upper-body"></div>
		<div className="lower-body"></div>
		<div className="tail"></div>
	</div>
)