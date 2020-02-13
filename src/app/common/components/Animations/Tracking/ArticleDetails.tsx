import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../../../../common/components/Icon';
import AnimationPlayState from '../AnimationPlayState';

export default (
	props: {
		children?: React.ReactNode,
		onAnimationEnd?: (event: React.AnimationEvent<HTMLDivElement>) => void,
		playState: AnimationPlayState,
		position: number
	}
) => (
	<div
		className={
			classNames(
				'article-details_brocy1',
				props.playState,
				`n-${props.position}`
			)
		}
		onAnimationEnd={props.onAnimationEnd}
	>
		<div className="rank">
			<ol className="numbers">
				<li className="number">
					<Icon
						display="block"
						name="trophy"
					/>
				</li>
				<li className="number">1</li>
				<li className="number">2</li>
				<li className="number">3</li>
				<li className="number">4</li>
			</ol>
		</div>
		<ol className="lines">
			<li className="line"></li>
			<li className="line"></li>
			<li className="line"></li>
		</ol>
		<div className="star">
			<Icon
				display="block"
				name="article-details-star"
			/>
		</div>
		<div className="children">
			{props.children}
		</div>
	</div>
);