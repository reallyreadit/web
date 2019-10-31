import ParseResult from './ParseResult';
import ContentContainer from './ContentContainer';
import { buildLineage, zipContentLineages, isImageContainerElement, isElement } from './utils';
import ImageContainer from './ImageContainer';
import { isValidContent, createMetadataElements } from './figureContent';
import ImageContainerContentConfig from './configuration/ImageContainerContentConfig';
import configs from './configuration/configs';

const whitelistedScriptTypes = [
	'application/json',
	'application/ld+json',
	'text/template',
	'text/x-readup-disabled-javascript'
];
function prune(element: ChildNode, depth: number, isInsideImageContainer: boolean, content: Node[][], images: ImageContainer[], config: ImageContainerContentConfig) {
	if (
		isElement(element) &&
		(element.id.startsWith('com_readup_') || element.nodeName === 'NOSCRIPT' || element.nodeName === 'BR')
	) {
		return;
	} else if (
		(depth > content.length - 1 || !content[depth].includes(element)) &&
		!(isInsideImageContainer && isElement(element) && isValidContent(element, config))
	) {
		element.remove();
	} else {
		const isImageContainer = !isInsideImageContainer && isImageContainerElement(element);
		if (isImageContainer) {
			const image = images.find(image => image.containerElement === element);
			if (image) {
				image.containerElement.classList.add('com_readup_article_image_container');
				createMetadataElements(image.caption, image.credit, element as HTMLElement);
			}
		}
		if (isElement(element)) {
			element.removeAttribute('style');
		}
		Array
			.from(element.childNodes)
			.forEach(child => {
				prune(child, depth + 1, isImageContainer || isInsideImageContainer, content, images, config);
			});
	}
}
export default function pruneDocument(parseResult: ParseResult) {
	// extend image container lineages if the search started at a lower depth
	let imageContainers = parseResult.imageContainers;
	if (parseResult.primaryTextRootNode !== parseResult.contentSearchRootElement) {
		const lineage = buildLineage({
			descendant: parseResult.primaryTextRootNode.parentElement,
			ancestor: parseResult.contentSearchRootElement
		});
		imageContainers = imageContainers.map(
			container => new ImageContainer(
				lineage.concat(container.containerLineage),
				container.contentLineages.map(contentLineage => lineage.concat(contentLineage)),
				container.caption,
				container.credit
			)
		);
	}
	// zip text and image content lineages
	let content = zipContentLineages(
		(parseResult.primaryTextContainers as ContentContainer[])
			.concat(imageContainers)
	);
	if (parseResult.contentSearchRootElement !== document.body) {
		// extend the content lineages up to the body element
		content = buildLineage({
				descendant: parseResult.contentSearchRootElement.parentElement,
				ancestor: document.body
			})
			.map(ancestor => ([ancestor]))
			.concat(content);
	}
	// check for whitelisted scripts
	const whitelistedScripts = Array
		.from(document.querySelectorAll('body script'))
		.filter(script => whitelistedScriptTypes.includes((script as HTMLScriptElement).type));
	if (whitelistedScripts.length) {
		Array
			.from(whitelistedScripts)
			.forEach(
				script => {
					buildLineage({
							descendant: script.hasChildNodes() ?
								script.childNodes[0] :
								script,
							ancestor: document.body
						})
						.forEach(
							(element, index) => {
								if (index < content.length) {
									if (!content[index].includes(element)) {
										content[index].push(element);
									}
								} else {
									content.push([element]);
								}
							}
						)
				}
			)
	}
	// strip head and body siblings
	Array
		.from(document.documentElement.children)
		.forEach(
			child => {
				if (child.nodeName !== 'HEAD' && child.nodeName !== 'BODY') {
					child.remove();
				}
			}
		);
	// copy the body style properties in case we are transitioning into reader mode in the extension
	const
		bodyOpacity = document.body.style.opacity,
		bodyTransition = document.body.style.transition;
	// prune the document
	prune(document.body, 0, false, content, imageContainers, configs.universal.imageContainerContent);
	// reapply body styles if we were transitioning
	if (document.body.classList.contains('com_readup_activating_reader_mode')) {
		document.body.style.opacity = bodyOpacity;
		document.body.style.transition = bodyTransition;
	}
	// trim the lineage if possible (this might break some sites. required on React sites that trash the root on script errors)
	if (document.body.children.length === 1) {
		let contentRoot: Element = document.body.children[0];
		while (
			contentRoot.children.length === 1 &&
			!parseResult.primaryTextContainers.some(container => container.containerElement === contentRoot)
		) {
			contentRoot = contentRoot.children[0];
		}
		if (contentRoot !== document.body.children[0]) {
			document.body.replaceChild(contentRoot, document.body.children[0]);
		}
	}
	// move the content into a new root element for css targeting
	const contentRoot = document.createElement('div');
	contentRoot.id = 'com_readup_article_content';
	contentRoot.append(
		...Array
			.from(document.body.children)
			.filter(
				child => !child.id.startsWith('com_readup_')
			)
	);
	document.body.prepend(contentRoot);
}