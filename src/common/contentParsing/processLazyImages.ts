// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import { createMetadataElements } from './figureContent';

export enum LazyImageStrategy {
	DataSrcSrcset,
	GizmodoImgUrl,
	GoverningImgSrcCorrection,
	HttpToHttps,
	MediumScaleUp,
	NautilusHostSwap,
	NoscriptImgContent,
	NytFigureMulti,
	PostLoadImgTag,
	QuantaScriptTemplate,
	WashingtonPostScaleUp,
}
function copyAttributes(
	source: Element,
	dest: Element,
	...attributeNames: (string | [string, string])[]
) {
	attributeNames.forEach((name) => {
		let sourceName: string, destName: string;
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
	});
}
function createObserver(
	elements: Element[],
	handler: (target: Element) => void
) {
	if (elements.length) {
		// iOS 11 WKWebView doesn't support IntersectionObserver
		if ('IntersectionObserver' in window) {
			const viewportObserver = new IntersectionObserver(
				(entries, observer) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							observer.unobserve(entry.target);
							handler(entry.target);
						}
					});
				},
				{
					rootMargin: '0px 0px 200px 0px',
				}
			);
			elements.forEach((image) => {
				viewportObserver.observe(image);
			});
		} else {
			// just load everything
			elements.forEach(handler);
		}
	}
}
const dataSrcSrcsetSelector =
	'img[data-src], img[data-srcset], source[data-src], source[data-srcset]';
function selectImageWidth(widths: number[]) {
	const sortedWidths = widths.slice().sort((a, b) => a - b);
	const screenPixelWidth = window.screen.availWidth * window.devicePixelRatio;
	return (
		sortedWidths.find((width) => width >= screenPixelWidth) ||
		sortedWidths[sortedWidths.length - 1]
	);
}
export default function procesLazyImages(strategy?: LazyImageStrategy): void {
	switch (strategy) {
		case LazyImageStrategy.DataSrcSrcset:
			createObserver(
				Array.from(document.querySelectorAll(dataSrcSrcsetSelector)).map(
					(element) => element.parentElement
				),
				(target) => {
					Array.from(target.querySelectorAll(dataSrcSrcsetSelector)).forEach(
						(element) => {
							if (
								element.hasAttribute('data-src') &&
								element.getAttribute('data-src') !== element.getAttribute('src')
							) {
								element.setAttribute('src', element.getAttribute('data-src'));
							}
							if (
								element.hasAttribute('data-srcset') &&
								element.getAttribute('data-srcset') !==
									element.getAttribute('srcset')
							) {
								element.setAttribute(
									'srcset',
									element.getAttribute('data-srcset')
								);
							}
							if (
								element.hasAttribute('src') &&
								element.getAttribute('src').startsWith('data:')
							) {
								element.removeAttribute('src');
							}
						}
					);
				}
			);
			break;
		case LazyImageStrategy.GizmodoImgUrl:
			createObserver(
				Array.from(document.querySelectorAll('figure[data-id][data-format]')),
				(figure: HTMLElement) => {
					const img = figure.getElementsByTagName('img')[0];
					if (img && img.src.startsWith('data:')) {
						img.src = `https://i.kinja-img.com/gawker-media/image/upload/c_scale,f_auto,fl_progressive,q_80,w_${selectImageWidth(
							[80, 320, 470, 800, 1600]
						)}/${figure.dataset['id']}.${figure.dataset[
							'format'
						].toLowerCase()}`;
					}
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
		case LazyImageStrategy.HttpToHttps:
			createObserver(
				Array.from(document.getElementsByTagName('img')),
				(target: HTMLImageElement) => {
					target.src = target.src.replace(/^http:/, 'https:');
				}
			);
			break;
		case LazyImageStrategy.MediumScaleUp:
			createObserver(
				Array.from(document.querySelectorAll('figure')),
				(target) => {
					const img = target.getElementsByTagName('img')[0];
					if (img.src) {
						const match = img.src.match(/(https:\/\/[^\/]+)\/.*\/([^\/?]+)/);
						if (match) {
							img.src = `${match[1]}/max/${img.getAttribute('width')}/${
								match[2]
							}`;
						}
					}
				}
			);
			break;
		case LazyImageStrategy.NautilusHostSwap:
			createObserver(
				Array.from(document.getElementsByTagName('figure')),
				(figure) => {
					Array.from(figure.getElementsByTagName('img')).forEach((img) => {
						if (img.src.match(/https?:\/\/static\.nautil\.us\//)) {
							img.src = img.src.replace(
								/https?:\/\/static\.nautil\.us\//,
								'https://d3chnh8fr629l6.cloudfront.net/'
							);
						}
					});
				}
			);
			break;
		case LazyImageStrategy.NoscriptImgContent:
			// iOS 11 WKWebView doesn't support s dotAll flag
			// Firefox complains when using s dotAll flag in literal even within try/catch block
			let noscriptImgContentRegex: RegExp;
			try {
				noscriptImgContentRegex = new RegExp(/^\s*<\s*img\s.+\s*>\s*$/, 'is');
			} catch {
				noscriptImgContentRegex = new RegExp(/^\s*<\s*img\s.+\s*>\s*$/, 'i');
			}
			createObserver(
				Array.from(document.getElementsByTagName('noscript')).map(
					(noscript) => noscript.parentElement
				),
				(target) => {
					Array.from(target.getElementsByTagName('noscript')).forEach(
						(noscript) => {
							if (noscriptImgContentRegex.test(noscript.textContent)) {
								const temp = document.createElement('div');
								temp.innerHTML = noscript.textContent;
								const img = temp.firstElementChild,
									imageContainer =
										noscript.parentElement.getElementsByClassName(
											'com_readup_article_image_container'
										)[0];
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
		case LazyImageStrategy.NytFigureMulti:
			const figures = Array.from(document.getElementsByTagName('figure'));
			const imageObjectFigures = figures.filter(
				(figure) =>
					figure.getAttribute('itemType') === 'http://schema.org/ImageObject'
			);
			if (imageObjectFigures.length) {
				createObserver(imageObjectFigures, (target) => {
					if (!target.getElementsByTagName('img').length) {
						const img = document.createElement('img');
						img.src = target.getAttribute('itemID');
						target.prepend(img);
					}
				});
			}
			const dataPatternImages = Array.from(
				document.querySelectorAll('img[data-pattern][data-widths]')
			);
			if (dataPatternImages.length) {
				createObserver(dataPatternImages, (img: HTMLImageElement) => {
					let src: string;
					try {
						let widths = JSON.parse(img.dataset['widths']) as
							| { master: { size: number; filename: string }[] }
							| number[];
						if (Array.isArray(widths)) {
							src = img.dataset['pattern'].replace(
								'{{size}}',
								selectImageWidth(widths).toString()
							);
						} else {
							const selectedSize = selectImageWidth(
								widths.master.map((width) => width.size)
							);
							src = img.dataset['pattern'].replace(
								'{{file}}',
								widths.master.find((width) => width.size === selectedSize)
									.filename
							);
						}
					} catch (ex) {
						src = img.dataset['mediaviewerSrc'];
					}
					if (src) {
						img.src = src;
					}
				});
			}
			break;
		case LazyImageStrategy.PostLoadImgTag:
			createObserver(
				Array.from(document.getElementsByTagName('postload-img')),
				(target) => {
					const img = document.createElement('img');
					copyAttributes(
						target,
						img,
						...[
							'data-alt',
							'data-class',
							'data-sizes',
							'data-src',
							'data-srcset',
							'data-title',
						].map<[string, string]>((dataAttr) => [
							dataAttr,
							dataAttr.split('-')[1],
						])
					);
					target.replaceWith(img);
				}
			);
			break;
		case LazyImageStrategy.QuantaScriptTemplate:
			const templateScripts = document.querySelectorAll(
				'div[id^="component-"] script'
			);
			if (templateScripts.length) {
				createObserver(
					Array.from(templateScripts).map((script) => script.parentElement),
					(div) => {
						const script = div.getElementsByTagName('script')[0];
						if (script) {
							try {
								const template = JSON.parse(script.textContent) as {
										data: { attribution: string; caption: string; src: string };
									},
									img = document.createElement('img');
								img.src = template.data.src;
								script.replaceWith(img);
								if (template.data.attribution || template.data.caption) {
									let caption: string, credit: string;
									const tempDiv = document.createElement('div');
									if (template.data.attribution) {
										tempDiv.innerHTML = template.data.attribution;
										credit = tempDiv.textContent;
									}
									if (template.data.caption) {
										tempDiv.innerHTML = template.data.caption;
										caption = tempDiv.textContent;
									}
									createMetadataElements(caption, credit, img);
								}
							} catch (ex) {}
						}
					}
				);
			}
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
			matches = document.querySelectorAll(
				'figure img[src^="https://miro.medium.com"]'
			);
			if (matches.length) {
				return procesLazyImages(LazyImageStrategy.MediumScaleUp);
			}
			matches = document.querySelectorAll(dataSrcSrcsetSelector);
			if (matches.length) {
				return procesLazyImages(LazyImageStrategy.DataSrcSrcset);
			}
			matches = document.querySelectorAll('img[src^="http:"]');
			if (matches.length) {
				return procesLazyImages(LazyImageStrategy.HttpToHttps);
			}
			matches = document.querySelectorAll('noscript');
			if (matches.length) {
				return procesLazyImages(LazyImageStrategy.NoscriptImgContent);
			}
			break;
	}
}
