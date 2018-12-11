const styleContent = `
html {
	font-family: serif;
	font-size: 16pt;
	line-height: 1.5em;
	background-color: ivory;
	color: #333;
}
body {
	margin: 10px auto;
	padding: 0 10px 100px 10px;
	max-width: 600px;
}
body * {
	max-width: 100%;
}
img {
	height: auto !important;
}
#rrit-title {
	font-size: 20pt;
	font-family: sans-serif;
	line-height: 1.25em;
	margin: 20px 0 10px 0;
}
#rrit-byline {
	font-style: italic;
	margin-bottom: 20px;
}
`;

export default (document: Document, title: string | null, byline: string | null) => {
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
			style.remove();
		});
	document.documentElement.removeAttribute('style');
	document.body.removeAttribute('style');
	// strip links
	Array
		.from(document.getElementsByTagName('a'))
		.forEach(a => {
			a.removeAttribute('href');
		});
	// add styles
	const styleElement = document.createElement('style');
	styleElement.type = 'text/css';
	styleElement.textContent = styleContent;
	document.body.appendChild(styleElement);
	// add title and byline
	if (byline) {
		const bylineElement = document.createElement('div');
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