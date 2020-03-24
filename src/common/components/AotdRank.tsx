import * as React from 'react';
import * as classNames from 'classnames';
import UserArticle from '../models/UserArticle';
import Icon from './Icon';

export default (
	props: {
		article: Pick<UserArticle, 'aotdContenderRank' | 'aotdTimestamp'>,
		callout?: React.ReactNode
	}
) => {
	const isRanked = (
		props.article.aotdContenderRank > 0 &&
		props.article.aotdContenderRank < 1000
	);
	return (
		<div className={
			classNames(
				'aotd-rank_tqv709',
				!props.article.aotdTimestamp ?
					[
						'contender',
						isRanked ?
							'length-' + props.article.aotdContenderRank.toString().length.toString() :
							null
					] :
					null
			)
		}>
			{props.article.aotdTimestamp ?
				<Icon
					display="block"
					name="trophy"
				/> :
				isRanked ?
					<>
						<small>#</small> {props.article.aotdContenderRank}
					</> :
					<span className="none">-</span>}
			{props.callout}
		</div>
	);
};