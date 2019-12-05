import * as React from 'react';
import classNames, { ClassValue } from 'classnames';
import * as commonmark from 'commonmark';

const
	reader = new commonmark.Parser(),
	writer = new commonmark.HtmlRenderer({ safe: true });
function render(plainText: string) {
	return writer.render(reader.parse(plainText));
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