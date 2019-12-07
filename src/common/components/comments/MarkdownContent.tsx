import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import * as commonmark from 'commonmark';
import * as linkify from 'linkify-it';

const
	reader = new commonmark.Parser(),
	writer = new commonmark.HtmlRenderer({ safe: true }),
	linkifyer = new linkify({
		'ftp:': null,
		'mailto:': null,
		'//:': null
	});
function createTextNode(text: string) {
	const node = new commonmark.Node('text');
	node.literal = text;
	return node;
}
function createLinkNode(url: string, text: string) {
	const node = new commonmark.Node('link');
	node.destination = url;
	node.appendChild(createTextNode(text));
	return node;
}
function render(plainText: string) {
	const ast = reader.parse(plainText);
	const walker = ast.walker();
	let step: commonmark.NodeWalkingStep | null;
	while (step = walker.next()) {
		let matches: linkify.Match[] | null;
		if (
			step.entering &&
			step.node.type === 'text' &&
			step.node.literal &&
			(matches = linkifyer.match(step.node.literal))
		) {
			let index = 0;
			for (const match of matches) {
				// preserve any text that appears before the match
				if (match.index > index) {
					step.node.insertBefore(createTextNode(step.node.literal.substring(index, match.index)));
				}
				// insert the link
				step.node.insertBefore(createLinkNode(match.url, match.text));
				// update the index
				index = match.lastIndex;
			}
			// preserve any text that appears after the last match
			if (index < step.node.literal.length) {
				step.node.insertBefore(createTextNode(step.node.literal.substring(index)));
			}
			// remove the text node
			step.node.unlink();
		}
	}
	return writer.render(ast);
}
export default (
	props: {
		className?: ClassValue,
		text: string
	}
) => (
	<div
		className={classNames('markdown-content_cculki', props.className)}
		dangerouslySetInnerHTML={{ __html: render(props.text) }}
	/>
);