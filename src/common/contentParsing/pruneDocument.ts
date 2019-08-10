import ParseResult from './ParseResult';
import ContentContainer from './ContentContainer';
import { buildLineage, zipContentLineages, isImageContainerElement, isElement } from './utils';
import ImageContainer from './ImageContainer';
import { isValidContent } from './figureContent';
import ImageContainerContentConfig from './configuration/ImageContainerContentConfig';
import configs from './configuration/configs';

function prune(element: ChildNode, depth: number, isInsideImageContainer: boolean, content: Node[][], images: ImageContainer[], config: ImageContainerContentConfig) {
	if (
		isElement(element) &&
		element.id.startsWith('com_readup_')
	) {
		return;
	} else if (
		(depth > content.length - 1 || !content[depth].includes(element)) &&
		(!(isInsideImageContainer && isElement(element) && isValidContent(element, config)))
	) {
		element.remove();
	} else {
		const isImageContainer = !isInsideImageContainer && isImageContainerElement(element);
		if (isImageContainer) {
			const image = images.find(image => image.containerElement === element);
			if (image) {
				image.containerElement.classList.add('rrit-image-container');
				if (image.credit) {
					const credit = document.createElement('div');
					credit.classList.add('rrit-image-credit');
					credit.textContent = image.credit;
					(element as HTMLElement).insertAdjacentElement('afterend', credit);
				}
				if (image.caption) {
					const caption = document.createElement('div');
					caption.classList.add('rrit-image-caption');
					caption.textContent = image.caption;
					(element as HTMLElement).insertAdjacentElement('afterend', caption);
				}
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
	Array
		.from(document.documentElement.children)
		.forEach(
			child => {
				if (child.nodeName !== 'HEAD' && child.nodeName !== 'BODY') {
					child.remove();
				}
			}
		);
	prune(
		document.body,
		0,
		false,
		(
				parseResult.contentSearchRootElement !== document.body ?
					buildLineage({
						descendant: parseResult.contentSearchRootElement.parentElement,
						ancestor: document.body
					})
					.map(ancestor => ([ancestor])) :
					[]
			)
			.concat(
				zipContentLineages(
					(parseResult.primaryTextContainers as ContentContainer[])
						.concat(imageContainers)
				)
			),
		imageContainers,
		configs.universal.imageContainerContent
	);
	if (document.body.children.length === 1) {
		let contentRoot: Element = document.body.children[0];
		while (contentRoot.children.length === 1) {
			contentRoot = contentRoot.children[0];
		}
		if (contentRoot !== document.body.children[0]) {
			document.body.replaceChild(contentRoot, document.body.children[0]);
		}
	}
}