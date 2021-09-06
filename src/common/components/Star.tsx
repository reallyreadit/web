import * as React from 'react';
import classNames from 'classnames';
import { ClassValue } from 'classnames/types';
import Icon from './Icon';

interface Props {
	className?: ClassValue,
	starred: boolean,
	busy: boolean,
	look?: 'muted' | 'action'
	onClick: () => void
}

const Star: React.FunctionComponent<Props> = (props) =>
	<div
		className={
			classNames(
				'star_n3lkaj',
				{
					starred: props.starred,
					busy: props.busy
				},
				`look--${props.look}`,
				props.className
			)
		}
		title={props.starred ? 'Unstar Article' : 'Star Article'}
	>
		<Icon
			badge={false}
			name="article-details-star"
			onClick={props.onClick}
		/>
	</div>;

Star.defaultProps = {
	look: 'muted'
}

export default Star;