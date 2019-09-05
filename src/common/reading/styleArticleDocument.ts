const styleContent = `
#com_readup_article {
	font-family: serif;
	font-size: 16pt;
	line-height: 1.35em;
	color: #222;
	margin: 0 auto;
	padding: 5vh 10px 350px 10px;
	max-width: 600px;
}
#com_readup_article #com_readup_article_content {
	padding-top: env(safe-area-inset-top);
}
#com_readup_article #com_readup_article_content * {
	max-width: 100%;
}
#com_readup_article #com_readup_article_content #com_readup_article_title {
	font-family: sans-serif;
	font-size: 20pt;
}
#com_readup_article #com_readup_article_content #com_readup_article_byline {
	font-size: 18pt;
	font-style: italic;
	font-weight: normal;
}
#com_readup_article #com_readup_article_content .com_readup_article_image_container:not(img) {
	margin: 1em;
}
#com_readup_article #com_readup_article_content .com_readup_article_image_caption {
	text-align: center;
	color: #999;
	font-size: 14pt;
	margin: 1em;
	line-height: normal;
}
#com_readup_article #com_readup_article_content .com_readup_article_image_credit {
	text-align: center;
	color: #999;
	font-size: 12pt;
	font-style: italic;
	margin: 1em;
	line-height: normal;
}
#com_readup_article #com_readup_article_content h1,
#com_readup_article #com_readup_article_content h2,
#com_readup_article #com_readup_article_content h3,
#com_readup_article #com_readup_article_content h4,
#com_readup_article #com_readup_article_content h5,
#com_readup_article #com_readup_article_content h6 {
	margin: 1em 0;
	line-height: normal;
}
#com_readup_article #com_readup_article_content p {
	margin: 1em 0;
}
#com_readup_article #com_readup_article_content blockquote {
	margin: 1em 0;
	border-left: 0.3em solid #ddd;
	padding: 0 1em;
	background-color: #fafafa;
	overflow: hidden;
	border-radius: 0.5em;
}
#com_readup_article #com_readup_article_content code,
#com_readup_article #com_readup_article_content pre {
	margin: 1em 0;
	border: 1px solid #ddd;
	padding: 1em;
	background-color: #fafafa;
	overflow: auto;
	font-family: monospace;
	font-size: 11pt;
}
#com_readup_article #com_readup_article_content p code,
#com_readup_article #com_readup_article_content p pre,
#com_readup_article #com_readup_article_content li code,
#com_readup_article #com_readup_article_content li pre {
	margin: 0;
	border: none;
	padding: 0 0.2em;
}
#com_readup_article #com_readup_article_content mark {
	background-color: inherit;
	color: inherit;
}
#com_readup_article #com_readup_article_content img {
	display: block;
	height: auto !important;
	margin: 0 auto;
}
`;

export default (document: Document, title: string | null, byline: string | null) => {
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
			if (!style.id.startsWith('com_readup_')) {
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
				if (!element.id.startsWith('com_readup_')) {
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