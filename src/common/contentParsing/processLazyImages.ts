export enum LazyImageStrategy {
	AtlanticFigureImgDataSrc,
	NytFigureImageObject,
	PostLoadImgTag
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
function createObserver(elements: HTMLCollectionOf<Element> | NodeListOf<Element>, handler: (target: Element) => void) {
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
	Array
		.from(elements)
		.forEach(
			image => {
				viewportObserver.observe(image);
			}
		);
}
export default function procesLazyImages(strategy: LazyImageStrategy) {
	switch (strategy) {
		case LazyImageStrategy.AtlanticFigureImgDataSrc:
			createObserver(
				document.querySelectorAll('figure'),
				target => {
					const img = target.getElementsByTagName('img')[0];
					if (!img.hasAttribute('srcset') && img.hasAttribute('data-srcset')) {
						img.srcset = img.getAttribute('data-srcset');
					}
				}
			);
			break;
		case LazyImageStrategy.NytFigureImageObject:
			createObserver(
				document.querySelectorAll('figure[itemType="http://schema.org/ImageObject"]'),
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
				document.getElementsByTagName('postload-img'),
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
	}
}