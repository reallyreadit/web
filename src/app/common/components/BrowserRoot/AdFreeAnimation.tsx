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

export default (props: {
	orientation?: 'landscape' | 'portrait';
}) => (
	<div
		className={classNames(
			'ad-free-animation_lv6n94',
			props.orientation || 'portrait'
		)}
	>
		<div className="screen">
			<div className="banner">
				<div className="video"></div>
				<div className="text">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
			<div className="popup">
				<div className="dialog">
					<div className="close"></div>
					<div className="title"></div>
					<div className="input"></div>
					<div className="button"></div>
				</div>
			</div>
			<div className="prompt">
				<div></div>
				<div></div>
				<div></div>
			</div>
			<article>
				<h1></h1>
				<p>
					<span>
						<a></a>
					</span>
					<span>
						<a></a>
					</span>
					<span></span>
				</p>
				<p>
					<span>
						<a></a>
					</span>
					<span>
						<a></a>
					</span>
					<span></span>
					<span>
						<a></a>
					</span>
				</p>
				<figure>
					<div></div>
				</figure>
				<p>
					<span></span>
					<span></span>
				</p>
				<p>
					<span></span>
					<span>
						<a></a>
						<a></a>
					</span>
					<span></span>
					<span>
						<a></a>
					</span>
				</p>
				<p>
					<span></span>
					<span>
						<a></a>
					</span>
					<span></span>
				</p>
				<p>
					<span>
						<a></a>
					</span>
					<span></span>
					<span></span>
					<span></span>
				</p>
			</article>
		</div>
	</div>
);
