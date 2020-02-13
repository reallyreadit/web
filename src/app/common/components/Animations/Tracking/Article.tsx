import * as React from 'react';
import Paragraph from './Paragraph';
import Figure from './Figure';

const paragraphGroups = [
	[
		{
			lastLineWidth: 90,
			lineCount: 3
		},
		{
			lastLineWidth: 80,
			lineCount: 4
		}
	],
	[
		{
			lastLineWidth: 85,
			lineCount: 2
		},
		{
			lastLineWidth: 40,
			lineCount: 4
		},
		{
			lastLineWidth: 82,
			lineCount: 3
		},
		{
			lastLineWidth: 75,
			lineCount: 4
		},
		{
			lastLineWidth: 50,
			lineCount: 4
		},
		{
			lastLineWidth: 100,
			lineCount: 2
		},
		{
			lastLineWidth: 85,
			lineCount: 2
		}
	],
	[
		{
			lastLineWidth: 70,
			lineCount: 4
		},
		{
			lastLineWidth: 90,
			lineCount: 3
		},
		{
			lastLineWidth: 95,
			lineCount: 5
		},
		{
			lastLineWidth: 50,
			lineCount: 4
		},
		{
			lastLineWidth: 90,
			lineCount: 6
		},
		{
			lastLineWidth: 70,
			lineCount: 3
		},
		{
			lastLineWidth: 85,
			lineCount: 2
		},
		{
			lastLineWidth: 60,
			lineCount: 4
		}
	],
	[
		{
			lastLineWidth: 75,
			lineCount: 5
		}
	]
];
export default () => (
	<article className="article_pw2r68">
		<h1></h1>
		{paragraphGroups.reduce<React.ReactNode[]>(
			(elements, group, groupIndex) => {
				elements.push(
					group.map(
						(paragraph, paragraphIndex) => (
							<Paragraph
								key={'p' + groupIndex.toString() + paragraphIndex.toString()}
								lastLineWidth={paragraph.lastLineWidth}
								lineCount={paragraph.lineCount}
							/>
						)
					)
				);
				if (groupIndex !== paragraphGroups.length - 1) {
					elements.push(
						<Figure key={'f' + groupIndex.toString()} />
					);
				}
				return elements;
			},
			[]
		)}
	</article>
);