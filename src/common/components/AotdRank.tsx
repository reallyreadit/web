// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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