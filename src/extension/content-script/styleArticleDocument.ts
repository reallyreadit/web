const styleContent = `
html {
	font-family: sans-serif;
}
body {
	margin: 10px auto;
	padding: 0 10px 120px 10px;
	max-width: 600px;
}
body * {
	max-width: 100%;
}
img {
	height: auto !important;
}
#rrit-byline {
	margin: 0.8em 0;
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