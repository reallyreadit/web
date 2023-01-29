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
import { ClassValue } from 'classnames/types';
import * as commonmark from 'commonmark';
import * as linkify from 'linkify-it';

const reader = new commonmark.Parser(),
	writer = new commonmark.HtmlRenderer({ safe: true }),
	linkifyer = new linkify({
		'ftp:': null,
		'mailto:': null,
		'//:': null,
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
	while ((step = walker.next())) {
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
					step.node.insertBefore(
						createTextNode(step.node.literal.substring(index, match.index))
					);
				}
				// insert the link
				step.node.insertBefore(createLinkNode(match.url, match.text));
				// update the index
				index = match.lastIndex;
			}
			// preserve any text that appears after the last match
			if (index < step.node.literal.length) {
				step.node.insertBefore(
					createTextNode(step.node.literal.substring(index))
				);
			}
			// remove the text node
			step.node.unlink();
		}
	}
	return writer.render(ast);
}
export default class MarkdownContent extends React.PureComponent<{
	className?: ClassValue;
	onNavTo: (url: string) => boolean;
	text: string;
}> {
	private readonly _handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		let anchorElement = event.target as HTMLElement;
		while (anchorElement && anchorElement.tagName !== 'A') {
			anchorElement = anchorElement.parentElement;
		}
		if (anchorElement) {
			this.props.onNavTo((anchorElement as HTMLAnchorElement).href);
		}
	};
	public render() {
		return (
			<div
				className={classNames('markdown-content_cculki', this.props.className)}
				dangerouslySetInnerHTML={{ __html: render(this.props.text) }}
				onClick={this._handleClick}
			/>
		);
	}
}
