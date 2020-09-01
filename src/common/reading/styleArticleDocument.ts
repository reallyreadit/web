import { isReadupElement } from '../contentParsing/utils';
import { formatList } from '../format';

const styleContent = `
#com_readup_document.com_readup_scroll_capture {
	height: 100vh;
}
#com_readup_article {
	font-family: serif;
	font-size: 16pt;
	line-height: 1.35;
}
#com_readup_document.com_readup_scroll_capture #com_readup_article {
	height: 100%;
	overflow: hidden;
}
#com_readup_document.com_readup_scroll_capture #com_readup_scroll_container {
	position: relative;
	height: 100%;
	overflow: auto;
	-webkit-overflow-scrolling: touch;
	z-index: 1;
}
#com_readup_scroll_container::after {
	content: "";
	display: block;
	height: 300px;
}
#com_readup_article_content {
	max-width: 640px;
	padding: 0 10px;
	margin: 0 auto;
	transition: opacity 350ms;
}
#com_readup_article_content * {
	max-width: 100%;
}
#com_readup_article_content h1,
#com_readup_article_content h2,
#com_readup_article_content h3,
#com_readup_article_content h4,
#com_readup_article_content h5,
#com_readup_article_content h6 {
	margin: 1em 0;
	line-height: 1.15;
	font-weight: bold;
}
#com_readup_article_content h1 {
	font-size: 1.3em;
}
#com_readup_article_content h2 {
	font-size: 1.25em;
}
#com_readup_article_content h3 {
	font-size: 1.2em;
}
#com_readup_article_content h4 {
	font-size: 1.15em;
}
#com_readup_article_content h5 {
	font-size: 1.1em;
}
#com_readup_article_content h6 {
	font-size: 1.05em;
}
#com_readup_article_content p,
#com_readup_article_content div[class*="para"] {
	margin: 1em 0;
}
#com_readup_article_content br + br {
	margin-bottom: 1em;
}
#com_readup_article_content blockquote {
	margin: 1em 0;
	border-left-width: 0.3em;
	border-left-style: solid;
	padding: 0 1em;
	overflow: hidden;
	border-radius: 0.5em;
}
#com_readup_article_content ol {
	padding-left: 1.5em;
	list-style: decimal;
}
#com_readup_article_content ul {
	padding-left: 1.5em;
	list-style: disc;
}
#com_readup_article_content code,
#com_readup_article_content pre {
	font-family: "Menlo", "Inconsolata", "Consolas", "Roboto Mono", "Ubuntu Mono", "Liberation Mono", "Courier New", monospace;
	font-size: 11pt;
	line-height: 1.45;
	border-width: 1px;
	border-style: solid;
	border-radius: 0.25em;
}
#com_readup_article_content code {
	padding: 0.1em 0.3em;
	tab-size: 2em;
}
#com_readup_article_content pre {
	padding: 1em;
	margin: 1em 0;
	overflow-x: auto;
}
#com_readup_article_content pre code {
	padding: 0;
	border: none;
	margin: 0;
}
#com_readup_article_content strong {
	font-weight: bold;
}
#com_readup_article_content mark {
	background-color: inherit;
	color: inherit;
}
#com_readup_article_content img {
	display: block;
	height: auto !important;
	margin: 1em auto;
}
#com_readup_article_content #com_readup_article_title {
	font-family: sans-serif;
	font-size: 1.5em;
	margin-top: 120px;
}
#com_readup_article_content #com_readup_article_byline {
	font-size: 18pt;
	font-style: italic;
}
#com_readup_article_content .com_readup_article_image_container:not(img) {
	margin: 1em;
}
#com_readup_article_content .com_readup_article_image_caption {
	text-align: center;
	font-size: 14pt;
	margin: 1em;
	line-height: 1.15;
}
#com_readup_article_content .com_readup_article_image_credit {
	text-align: center;
	font-size: 12pt;
	font-style: italic;
	margin: 1em;
	line-height: 1.15;
}

#com_readup_document {
	color: #222;
	background-color: #fdfdfd
}
.com_readup_article_image_caption,
.com_readup_article_image_credit {
	color: #999;
}
#com_readup_article_content blockquote {
	border-left-color: #e8e8e8;
	background-color: #fafafa;
}
#com_readup_article_content code,
#com_readup_article_content pre {
	border-color: #e8e8e8;
	background-color: #eeeeff;
}

@media (prefers-color-scheme: dark) {
	#com_readup_document {
		color: #bbbbbb;
		background-color: #181818;
	}
	.com_readup_article_image_caption,
	.com_readup_article_image_credit {
		color: #999;
	}
	#com_readup_article_content blockquote {
		border-left-color: #404040;
		background-color: #303030;
	}
	#com_readup_article_content code,
	#com_readup_article_content pre {
		border-color: #404040;
		background-color: #212121;
	}
}

#com_readup_article_content pre .c { color: #998; font-style: italic; }
#com_readup_article_content pre .err { color: #a61717; background-color: #e3d2d2; }
#com_readup_article_content pre .k { font-weight: bold; }
#com_readup_article_content pre .o { font-weight: bold; }
#com_readup_article_content pre .cm { color: #998; font-style: italic; }
#com_readup_article_content pre .cp { color: #999; font-weight: bold; }
#com_readup_article_content pre .c1 { color: #998; font-style: italic; }
#com_readup_article_content pre .cs { color: #999; font-weight: bold; font-style: italic; }
#com_readup_article_content pre .gd { color: #000; background-color: #fdd; }
#com_readup_article_content pre .gd .x { color: #000; background-color: #faa; }
#com_readup_article_content pre .ge { font-style: italic; }
#com_readup_article_content pre .gr { color: #a00; }
#com_readup_article_content pre .gh { color: #999; }
#com_readup_article_content pre .gi { color: #000; background-color: #dfd; }
#com_readup_article_content pre .gi .x { color: #000; background-color: #afa; }
#com_readup_article_content pre .go { color: #888; }
#com_readup_article_content pre .gp { color: #555; }
#com_readup_article_content pre .gs { font-weight: bold; }
#com_readup_article_content pre .gu { color: #aaa; }
#com_readup_article_content pre .gt { color: #a00; }
#com_readup_article_content pre .kc { font-weight: bold; }
#com_readup_article_content pre .kd { font-weight: bold; }
#com_readup_article_content pre .kp { font-weight: bold; }
#com_readup_article_content pre .kr { font-weight: bold; }
#com_readup_article_content pre .kt { color: #458; font-weight: bold; }
#com_readup_article_content pre .m { color: #099; }
#com_readup_article_content pre .s { color: #d14; }
#com_readup_article_content pre .na { color: #008080; }
#com_readup_article_content pre .nb { color: #0086B3; }
#com_readup_article_content pre .nc { color: #458; font-weight: bold; }
#com_readup_article_content pre .no { color: #008080; }
#com_readup_article_content pre .ni { color: #800080; }
#com_readup_article_content pre .ne { color: #900; font-weight: bold; }
#com_readup_article_content pre .nf { color: #900; font-weight: bold; }
#com_readup_article_content pre .nn { color: #555; }
#com_readup_article_content pre .nt { color: #000080; }
#com_readup_article_content pre .nv { color: #008080; }
#com_readup_article_content pre .ow { font-weight: bold; }
#com_readup_article_content pre .w { color: #bbb; }
#com_readup_article_content pre .mf { color: #099; }
#com_readup_article_content pre .mh { color: #099; }
#com_readup_article_content pre .mi { color: #099; }
#com_readup_article_content pre .mo { color: #099; }
#com_readup_article_content pre .sb { color: #d14; }
#com_readup_article_content pre .sc { color: #d14; }
#com_readup_article_content pre .sd { color: #d14; }
#com_readup_article_content pre .s2 { color: #d14; }
#com_readup_article_content pre .se { color: #d14; }
#com_readup_article_content pre .sh { color: #d14; }
#com_readup_article_content pre .si { color: #d14; }
#com_readup_article_content pre .sx { color: #d14; }
#com_readup_article_content pre .sr { color: #009926; }
#com_readup_article_content pre .s1 { color: #d14; }
#com_readup_article_content pre .ss { color: #990073; }
#com_readup_article_content pre .bp { color: #999; }
#com_readup_article_content pre .vc { color: #008080; }
#com_readup_article_content pre .vg { color: #008080; }
#com_readup_article_content pre .vi { color: #008080; }
#com_readup_article_content pre .il { color: #099; }

@media (prefers-color-scheme: dark) {
	#com_readup_article_content pre .c { color: #646464; font-style: italic; }
	#com_readup_article_content pre .err { color: #f07178; background-color: #e3d2d2; }
	#com_readup_article_content pre .k { color: #89DDFF; font-weight: bold; }
	#com_readup_article_content pre .o { font-weight: bold; }
	#com_readup_article_content pre .cm { color: #646464; font-style: italic; }
	#com_readup_article_content pre .cp { color: #646464; font-weight: bold; }
	#com_readup_article_content pre .c1 { color: #646464; font-style: italic; }
	#com_readup_article_content pre .cs { color: #646464; font-weight: bold; font-style: italic; }
	#com_readup_article_content pre .gd { color: #000; background-color: #fdd; }
	#com_readup_article_content pre .gd .x { color: #000; background-color: #faa; }
	#com_readup_article_content pre .ge { font-style: italic; }
	#com_readup_article_content pre .gr { color: #f07178; }
	#com_readup_article_content pre .gh { color: #999; }
	#com_readup_article_content pre .gi { color: #000; background-color: #dfd; }
	#com_readup_article_content pre .gi .x { color: #000; background-color: #afa; }
	#com_readup_article_content pre .go { color: #888; }
	#com_readup_article_content pre .gp { color: #555; }
	#com_readup_article_content pre .gs { font-weight: bold; }
	#com_readup_article_content pre .gu { color: #aaa; }
	#com_readup_article_content pre .gt { color: #f07178; }
	#com_readup_article_content pre .kc { font-weight: bold; }
	#com_readup_article_content pre .kd { font-weight: bold; }
	#com_readup_article_content pre .kp { font-weight: bold; }
	#com_readup_article_content pre .kr { font-weight: bold; }
	#com_readup_article_content pre .kt { color: #FFCB6B; font-weight: bold; }
	#com_readup_article_content pre .m { color: #F78C6C; }
	#com_readup_article_content pre .s { color: #C3E88D; }
	#com_readup_article_content pre .na { color: #008080; }
	#com_readup_article_content pre .nb { color: #EEFFFF; }
	#com_readup_article_content pre .nc { color: #FFCB6B; font-weight: bold; }
	#com_readup_article_content pre .no { color: #008080; }
	#com_readup_article_content pre .ni { color: #800080; }
	#com_readup_article_content pre .ne { color: #900; font-weight: bold; }
	#com_readup_article_content pre .nf { color: #82AAFF; font-weight: bold; }
	#com_readup_article_content pre .nn { color: #555; }
	#com_readup_article_content pre .nt { color: #FFCB6B; }
	#com_readup_article_content pre .nv { color: #EEFFFF; }
	#com_readup_article_content pre .ow { font-weight: bold; }
	#com_readup_article_content pre .w { color: #EEFFFF; }
	#com_readup_article_content pre .mf { color: #F78C6C; }
	#com_readup_article_content pre .mh { color: #F78C6C; }
	#com_readup_article_content pre .mi { color: #F78C6C; }
	#com_readup_article_content pre .mo { color: #F78C6C; }
	#com_readup_article_content pre .sb { color: #C3E88D; }
	#com_readup_article_content pre .sc { color: #C3E88D; }
	#com_readup_article_content pre .sd { color: #C3E88D; }
	#com_readup_article_content pre .s2 { color: #C3E88D; }
	#com_readup_article_content pre .se { color: #EEFFFF; }
	#com_readup_article_content pre .sh { color: #C3E88D; }
	#com_readup_article_content pre .si { color: #C3E88D; }
	#com_readup_article_content pre .sx { color: #C3E88D; }
	#com_readup_article_content pre .sr { color: #C3E88D; }
	#com_readup_article_content pre .s1 { color: #C3E88D; }
	#com_readup_article_content pre .ss { color: #C3E88D; }
	#com_readup_article_content pre .bp { color: #999; }
	#com_readup_article_content pre .vc { color: #FFCB6B; }
	#com_readup_article_content pre .vg { color: #EEFFFF; }
	#com_readup_article_content pre .vi { color: #EEFFFF; }
	#com_readup_article_content pre .il { color: #F78C6C; }
}
`;

export function createByline(authors: string[] | { name?: string }[]) {
	if (!authors.length) {
		return '';
	}
	let authorNames: string[];
	if (typeof authors[0] === 'string') {
		authorNames = authors as string[];
	} else {
		authorNames = (authors as { name?: string }[]).map(
			author => author.name
		);
	}
	return formatList(
		authorNames
			.reduce<string[]>(
				(names, name) => {
					if (!!name) {
						const trimmedName = name.trim();
						if (
							!names.some(
								existingAuthorName => existingAuthorName.toLowerCase() === trimmedName.toLowerCase()
							)
						) {
							names.push(trimmedName);
						}
					}
					return names;
				},
				[]
			)
			.sort()
	);
}
export default (
	{
		document,
		title,
		byline,
		useScrollContainer
	}:
	{
		document: Document,
		title?: string,
		byline?: string,
		useScrollContainer?: boolean
	}
) => {
	// add viewport meta
	if (!document.querySelectorAll('meta[name="viewport"]').length) {
		const metaElement = document.createElement('meta');
		metaElement.setAttribute('name', 'viewport');
		metaElement.setAttribute('content', 'width=device-width,initial-scale=1,minimum-scale=1,viewport-fit=cover');
		document.head.appendChild(metaElement);
		window.setTimeout(() => {
			window.scrollTo(0, 0);
		}, 500);
	}
	// strip styles
	Array
		.from(document.getElementsByTagName('link'))
		.forEach(link => {
			if (link.rel && link.rel.toLowerCase() === 'stylesheet') {
				link.remove();
			}
		});
	Array
		.from(document.getElementsByTagName('style'))
		.forEach(style => {
			if (!isReadupElement(style)) {
				style.remove();	
			}
		});
	const
		bodyOpacity = document.body.style.opacity,
		bodyTransition = document.body.style.transition;
	Array
		.from(document.querySelectorAll('[align], [style]'))
		.forEach(
			element => {
				if (!isReadupElement(element)) {
					element.removeAttribute('align');
					element.removeAttribute('style');
				}
			}
	);
	if (document.body.classList.contains('com_readup_activating_reader_mode')) {
		document.body.style.opacity = bodyOpacity;
		document.body.style.transition = bodyTransition;
	}
	// strip links
	Array
		.from(document.getElementsByTagName('a'))
		.forEach(a => {
			a.removeAttribute('href');
		});
	// add custom classes
	document.documentElement.id = 'com_readup_document';
	if (useScrollContainer) {
		document.documentElement.classList.add('com_readup_scroll_capture');
	}
	document.body.id = 'com_readup_article';
	// add styles
	const styleElement = document.createElement('style');
	styleElement.type = 'text/css';
	styleElement.textContent = styleContent;
	document.body.appendChild(styleElement);
	// add title and byline
	const contentRoot = document.getElementById('com_readup_article_content');
	if (byline) {
		const bylineElement = document.createElement('h2');
		bylineElement.id = 'com_readup_article_byline';
		bylineElement.textContent = byline;
		contentRoot.prepend(bylineElement);
	}
	if (title) {
		const titleElement = document.createElement('h1');
		titleElement.id = 'com_readup_article_title';
		titleElement.textContent = title;
		contentRoot.prepend(titleElement);
	}
}