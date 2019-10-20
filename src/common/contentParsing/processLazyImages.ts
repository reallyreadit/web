export enum LazyImageStrategy {
	DataSrcSrcset,
	GoverningImgSrcCorrection,
	MediumScaleUp,
	NoscriptImgContent,
	NytFigureImageObject,
	PostLoadImgTag,
	WashingtonPostScaleUp
}
function copyAttributes(source: Element, dest: Element, ...attributeNames: (string | [string, string])[]) {
	attributeNames.forEach(
		name => {
			let
				sourceName: string,
				destName: string;
			if (typeof name === 'string') {
				sourceName = name;
				destName = name;
			} else {
				sourceName = name[0];
				destName = name[1];
			}
			if (source.hasAttribute(sourceName)) {
				dest.setAttribute(destName, source.getAttribute(sourceName));
			}
		}
	);
}
function createObserver(elements: Element[], handler: (target: Element) => void) {
	if (elements.length) {
		// iOS 11 WKWebView doesn't support IntersectionObserver
		if ('IntersectionObserver' in window) {
			const viewportObserver = new IntersectionObserver(
				(entries, observer) => {
					entries.forEach(
						entry => {
							if (entry.isIntersecting) {
								observer.unobserve(entry.target);
								handler(entry.target);
							}
						}
					);
				},
				{
					rootMargin: '0px 0px 200px 0px'
				}
			);
			elements.forEach(
				image => {
					viewportObserver.observe(image);
				}
			);
		} else {
			// just load everything
			elements.forEach(handler);
		}
	}
}
const dataSrcSrcsetSelector = 'img[data-src], img[data-srcset], source[data-src], source[data-srcset]';
export default function procesLazyImages(strategy?: LazyImageStrategy): void {
	switch (strategy) {
		case LazyImageStrategy.DataSrcSrcset:
			createObserver(
				Array
					.from(document.querySelectorAll(dataSrcSrcsetSelector))
					.map(
						element => element.parentElement
					),
				target => {
					Array
						.from(target.querySelectorAll(dataSrcSrcsetSelector))
						.forEach(
							element => {
								if (element.hasAttribute('data-src') && element.getAttribute('data-src') !== element.getAttribute('src')) {
									element.setAttribute('src', element.getAttribute('data-src'));
								}
								if (element.hasAttribute('data-srcset') && element.getAttribute('data-srcset') !== element.getAttribute('srcset')) {
									element.setAttribute('srcset', element.getAttribute('data-srcset'));
								}
								if (element.hasAttribute('src') && element.getAttribute('src').startsWith('data:')) {
									element.removeAttribute('src');
								}
							}
						);
				}
			);
			break;
		case LazyImageStrategy.GoverningImgSrcCorrection:
			createObserver(
				Array.from(document.querySelectorAll('img')),
				(target: HTMLImageElement) => {
					target.src = target.src
						.replace(/^http:/, 'https:')
						.replace(/&.*$/, '');
				}
			);
			break;
		case LazyImageStrategy.MediumScaleUp:
			createObserver(
				Array.from(document.querySelectorAll('figure')),
				target => {
					const img = target.getElementsByTagName('img')[0];
					if (img.src) {
						const match = img.src.match(/(https:\/\/[^\/]+)\/.*\/([^\/?]+)/);
						if (match) {
							img.src = `${match[1]}/max/${img.getAttribute('width')}/${match[2]}`;
						}
					}
				}
			);
			break;
		case LazyImageStrategy.NoscriptImgContent:
			// iOS 11 WKWebView doesn't support s dotAll flag
			let noscriptImgContentRegex: RegExp;
			try {
				noscriptImgContentRegex = /^\s*<\s*img\s.+\s*>\s*$/is;
			} catch {
				noscriptImgContentRegex = /^\s*<\s*img\s.+\s*>\s*$/i;
			}
			createObserver(
				Array
					.from(document.getElementsByTagName('noscript'))
					.map(noscript => noscript.parentElement),
				target => {
					Array
						.from(target.getElementsByTagName('noscript'))
						.forEach(
							noscript => {
								if (noscriptImgContentRegex.test(noscript.textContent)) {
									const temp = document.createElement('div');
									temp.innerHTML = noscript.textContent;
									const
										img = temp.firstElementChild,
										imageContainer = noscript.parentElement.getElementsByClassName('com_readup_article_image_container')[0];
									if (imageContainer) {
										if (imageContainer.nodeName === 'FIGURE') {
											imageContainer.append(img);
										} else {
											img.classList.add('com_readup_article_image_container');
											imageContainer.replaceWith(img);
										}
									} else {
										noscript.replaceWith(img);
									}
								}
							}
						);
				}
			);
			break;
		case LazyImageStrategy.NytFigureImageObject:
			createObserver(
				Array.from(document.querySelectorAll('figure[itemType="http://schema.org/ImageObject"]')),
				target => {
					if (!target.getElementsByTagName('img').length) {
						const img = document.createElement('img');
						img.src = target.getAttribute('itemID');
						target.prepend(img);
					}
				}
			);
			break;
		case LazyImageStrategy.PostLoadImgTag:
			createObserver(
				Array.from(document.getElementsByTagName('postload-img')),
				target => {
					const img = document.createElement('img');
					copyAttributes(
						target,
						img,
						...['data-alt', 'data-class', 'data-sizes', 'data-src', 'data-srcset', 'data-title']
							.map<[string, string]>(dataAttr => ([dataAttr, dataAttr.split('-')[1]]))
					);
					target.replaceWith(img);
				}
			);
			break;
		case LazyImageStrategy.WashingtonPostScaleUp:
			createObserver(
				Array.from(document.querySelectorAll('img[data-hi-res-src]')),
				(target: HTMLImageElement) => {
					target.src = target.getAttribute('data-hi-res-src');
				}
			);
			break;
		default:
			// search for known strategies
			let matches: NodeListOf<Element>;
			matches = document.querySelectorAll('figure img[src^="https://miro.medium.com"]');
			if (matches.length) {
				return procesLazyImages(LazyImageStrategy.MediumScaleUp);
			}
			matches = document.querySelectorAll(dataSrcSrcsetSelector);
			if (matches.length) {
				return procesLazyImages(LazyImageStrategy.DataSrcSrcset);
			}
			matches = document.querySelectorAll('noscript');
			if (matches.length) {
				return procesLazyImages(LazyImageStrategy.NoscriptImgContent);
			}
			break;
	}
}