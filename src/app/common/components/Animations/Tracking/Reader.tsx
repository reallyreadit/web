import * as React from 'react';
import Article from './Article';
import * as classNames from 'classnames';
import Cat from './Cat';
import Icon from '../../../../../common/components/Icon';
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
				'reader_s9p6xn',
				props.playState,
				`n-${props.position}`
			)
		}
	>
		<div className="device">
			<div className="screen">
				<nav>
					<div className="progress">
						<Icon
							display="block"
							name="checkmark"
						/>
					</div>
				</nav>
				<main>
					<Article />
				</main>
			</div>
		</div>
		<Cat 
			playState={props.playState}
			position={props.position}
		/>
	</div>
);