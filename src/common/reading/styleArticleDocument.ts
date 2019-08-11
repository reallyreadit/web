const styleContent = `
#rrit-article {
	font-family: serif;
	font-size: 16pt;
	line-height: 1.35em;
	color: #222;
	margin: 0 auto;
	padding: 5vh 10px 350px 10px;
	max-width: 600px;
}
#rrit-article * {
	max-width: 100%;
}
#rrit-article #rrit-title {
	font-family: sans-serif;
	font-size: 20pt;
}
#rrit-article #rrit-byline {
	font-size: 18pt;
	font-style: italic;
	font-weight: normal;
}
#rrit-article .rrit-image-container:not(img) {
	margin: 1em;
}
#rrit-article .rrit-image-caption {
	text-align: center;
	color: #999;
	font-size: 14pt;
	margin: 1em;
	line-height: normal;
}
#rrit-article .rrit-image-credit {
	text-align: center;
	color: #999;
	font-size: 12pt;
	font-style: italic;
	margin: 1em;
	line-height: normal;
}
#rrit-article h1,
#rrit-article h2,
#rrit-article h3,
#rrit-article h4,
#rrit-article h5,
#rrit-article h6,
#rrit-article p {
	margin: 1em 0;
}
#rrit-article blockquote {
	margin: 1em 0;
	border-left: 0.3em solid #ddd;
	padding: 0 1em;
	background-color: #fafafa;
	overflow: hidden;
	border-radius: 0.5em;
}
#rrit-article code,
#rrit-article pre {
	margin: 1em 0;
	border: 1px solid #ddd;
	padding: 1em;
	background-color: #fafafa;
	overflow: auto;
	font-family: monospace;
	font-size: 11pt;
}
#rrit-article p code,
#rrit-article p pre,
#rrit-article li code,
#rrit-article li pre {
	margin: 0;
	border: none;
	padding: 0 0.2em;
}
#rrit-article mark {
	background-color: inherit;
	color: inherit;
}
#rrit-article img {
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
		metaElement.setAttribute('content', 'width=device-width,initial-scale=1,user-scalable=no');
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
		.from(document.querySelectorAll('[style]'))
		.forEach(
			element => {
				if (!element.id.startsWith('com_readup_')) {
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
	document.body.id = 'rrit-article';
	// add styles
	const styleElement = document.createElement('style');
	styleElement.type = 'text/css';
	styleElement.textContent = styleContent;
	document.body.appendChild(styleElement);
	// add title and byline
	if (byline) {
		const bylineElement = document.createElement('h2');
		bylineElement.id = 'rrit-byline';
		bylineElement.textContent = byline;
		document.body.insertBefore(bylineElement, document.body.children[0]);
	}
	if (title) {
		const titleElement = document.createElement('h1');
		titleElement.id = 'rrit-title';
		titleElement.textContent = title;
		document.body.insertBefore(titleElement, document.body.children[0]);
	}
}