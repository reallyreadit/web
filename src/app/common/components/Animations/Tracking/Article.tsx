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
import Paragraph from './Paragraph';
import Figure from './Figure';

const paragraphGroups = [
	[
		{
			lastLineWidth: 90,
			lineCount: 3,
		},
		{
			lastLineWidth: 80,
			lineCount: 4,
		},
	],
	[
		{
			lastLineWidth: 85,
			lineCount: 2,
		},
		{
			lastLineWidth: 40,
			lineCount: 4,
		},
		{
			lastLineWidth: 82,
			lineCount: 3,
		},
		{
			lastLineWidth: 75,
			lineCount: 4,
		},
		{
			lastLineWidth: 50,
			lineCount: 4,
		},
		{
			lastLineWidth: 100,
			lineCount: 2,
		},
		{
			lastLineWidth: 85,
			lineCount: 2,
		},
	],
	[
		{
			lastLineWidth: 70,
			lineCount: 4,
		},
		{
			lastLineWidth: 90,
			lineCount: 3,
		},
		{
			lastLineWidth: 95,
			lineCount: 5,
		},
		{
			lastLineWidth: 50,
			lineCount: 4,
		},
		{
			lastLineWidth: 90,
			lineCount: 6,
		},
		{
			lastLineWidth: 70,
			lineCount: 3,
		},
		{
			lastLineWidth: 85,
			lineCount: 2,
		},
		{
			lastLineWidth: 60,
			lineCount: 4,
		},
	],
	[
		{
			lastLineWidth: 75,
			lineCount: 5,
		},
	],
];
export default () => (
	<article className="article_pw2r68">
		<h1></h1>
		{paragraphGroups.reduce<React.ReactNode[]>(
			(elements, group, groupIndex) => {
				elements.push(
					group.map((paragraph, paragraphIndex) => (
						<Paragraph
							key={'p' + groupIndex.toString() + paragraphIndex.toString()}
							lastLineWidth={paragraph.lastLineWidth}
							lineCount={paragraph.lineCount}
						/>
					))
				);
				if (groupIndex !== paragraphGroups.length - 1) {
					elements.push(<Figure key={'f' + groupIndex.toString()} />);
				}
				return elements;
			},
			[]
		)}
	</article>
);
