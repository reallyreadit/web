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
import Article from './Article';
import * as classNames from 'classnames';
import Cat from './Cat';
import Icon from '../../../../../common/components/Icon';
import AnimationPlayState from '../AnimationPlayState';

export default (props: {
	playState: AnimationPlayState;
	position: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}) => (
	<div
		className={classNames(
			'reader_s9p6xn',
			props.playState,
			`n-${props.position}`
		)}
	>
		<div className="device">
			<div className="screen">
				<nav>
					<div className="progress">
						<Icon display="block" name="checkmark" />
					</div>
				</nav>
				<main>
					<Article />
				</main>
			</div>
		</div>
		<Cat playState={props.playState} position={props.position} />
	</div>
);
