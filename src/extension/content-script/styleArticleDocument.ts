const styleContent = `
html {
	font-family: serif;
	font-size: 16pt;
	line-height: 1.5em;
	color: #222;
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
function createAbsoluteUrl(baseUrl: string, attrValue: string) {
	if (/^\/\/|https?:/i.test(attrValue)) {
		// absolute url
		return attrValue.replace(/^\/\/|http:\/\//, 'https://');
	} else if (/^\//.test(attrValue)) {
		// absolute path
		return (
			'https://' +
			new URL(baseUrl).host +
			attrValue
		);
	} else {
		// relative path
		return (
			baseUrl.replace(/^http:/, 'https:') +
			(/\/$/.test(baseUrl) ? '' : '/') +
			attrValue
		);
	}
}

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
	// fix images
	Array
		.from(document.getElementsByTagName('img'))
		.forEach(img => {
			// special case for nyt
			if (img.hasAttribute('data-pattern') && img.hasAttribute('data-widths')) {
				try {
					const
						masterImages = (JSON.parse(img.getAttribute('data-widths')) as {
								master: {
									filename: string,
									size: number
								}[]
							})
							.master,
						smallImages = masterImages.filter(image => image.size <= 800);
					let fileName: string;
					if (smallImages.length) {
						fileName = smallImages.sort((a, b) => b.size - a.size)[0].filename;
					} else {
						fileName = masterImages.sort((a, b) => a.size - b.size)[0].filename;
					}
					img.setAttribute(
						'src',
						img
							.getAttribute('data-pattern')
							.replace('{{file}}', fileName)
					);
					return;
				} catch (error) {
					// continue to trying the standard methods
				}
			}
			const baseUrl = img.getAttribute('data-rrit-base-url');
			if (baseUrl) {
				const originalSrc = img.getAttribute('data-rrit-src') || img.getAttribute('data-src');
				if (originalSrc) {
					img.setAttribute('src', createAbsoluteUrl(img.getAttribute('data-rrit-base-url'), originalSrc.trim()));
				}
				const originalSrcset = img.getAttribute('data-rrit-srcset') || img.getAttribute('data-srcset');
				if (originalSrcset) {
					img.setAttribute(
						'srcset',
						originalSrcset
							.split(',')
							.map(src => {
								const
									parts = src
										.trim()
										.split(/\s+/),
									newSrc = createAbsoluteUrl(baseUrl, parts[0]);
								if (parts.length === 2) {
									return newSrc + ' ' + parts[1];
								}
								return newSrc;
							})
							.join(', ')
					);
				}
			}
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