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

export default (
	props: {
		lastLineWidth?: number,
		lineCount: number
	}
) => (
	<p className="paragraph_wznl0z">
		{Array
			.from(new Array(props.lineCount))
			.map(
				(_, index) => (
					<span
						key={index}
						style={
							index === props.lineCount - 1 && props.lastLineWidth ?
								{ width: props.lastLineWidth + '%' } :
								null
						}
					></span>
				)
			)}
	</p>
);