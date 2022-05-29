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