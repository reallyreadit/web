import TextContainerDepthGroup from './TextContainerDepthGroup';
import TraversalPathSearchResult from './TraversalPathSearchResult';
import TraversalPath from './TraversalPath';
import ImageContainer from './ImageContainer';
import GraphEdge from './GraphEdge';
import TextContainer from './TextContainer';
import ChildNodeSearchResult from './ChildNodeSearchResult';
import { zipContentLineages, buildLineage, isElement, isImageContainerElement, findWordsInAttributes, isValidImgElement } from './utils';
import ParseResult from './ParseResult';
import { isValidContent as isValidFigureContent } from './figureContent';
import Config from './configuration/Config';
import ContainerSearchConfig from './configuration/ContainerSearchConfig';
import ImageContainerMetadataConfig from './configuration/ImageContainerMetadataConfig';
import TextContainerSelectionConfig from './configuration/TextContainerSelectionConfig';
import TextContainerSearchConfig from './configuration/TextContainerSearchConfig';
import ImageContainerContentConfig from './configuration/ImageContainerContentConfig';
import configs from './configuration/configs';
import { findPublisherConfig } from './configuration/PublisherConfig';
import ElementSelector from './configuration/ElementSelector';
import ContainerFilterConfig from './configuration/ContainerFilterConfig';
import TextContainerFilterConfig from './configuration/TextContainerFilterConfig';

// regular expressions
const wordRegex = /\S+/g;
const singleSentenceRegex = /^[^.!?]+[.!?'"]*$/;
const recircRegex = /^[^:]+:.+$/

// misc
function findDescendantsMatchingQuerySelectors(element: Element, selectors: string[]) {
	return selectors
		.map(selector => element.querySelectorAll(selector))
		.reduce<Element[]>((elements, element) => elements.concat(Array.from(element)), []);
}
function getWordCount(node: Node) {
	return (node.textContent.match(wordRegex) || []).length;
};
function searchUpLineage(lineage: Node[], test: (node: Node, index: number) => boolean) {
	for (let i = lineage.length - 1; i >= 0; i--) {
		const ancestor = lineage[i];
		if (test(ancestor, i)) {
			return ancestor;
		}
	}
	return null;
}
function selectElements(arg0: ElementSelector | ElementSelector[]): Element[] {
	if (Array.isArray(arg0)) {
		return arg0.reduce<Element[]>(
			(elements, selector) => elements.concat(selectElements(selector)),
			[]
		);
	}
	if (typeof arg0 === 'string') {
		return Array.from(document.querySelectorAll(arg0));
	}
	return arg0();
}

// filtering
function areContainerAttributesValid(element: Element, config: ContainerFilterConfig) {
	const words = findWordsInAttributes(element);
	return !(
		words.some(
			word => (
				(
					config.attributeFullWordBlacklist.includes(word) ||
					config.attributeWordPartBlacklist.some(wordPart => word.includes(wordPart))
				) &&
				!words.some(word => config.attributeFullWordWhitelist.includes(word))
			)
		)
	);
}
function isImageContainerMetadataValid(image: ImageContainer, config: ImageContainerMetadataConfig) {
	const meta = (image.caption || '') + ' ' + (image.credit || '');
	return !(
		config.contentRegexBlacklist.some(regex => regex.test(meta)) &&
		!config.contentRegexWhitelist.some(regex => regex.test(meta))
	);
}
function isTextContentValid(block: Element, config: TextContainerFilterConfig) {
	const links = block.getElementsByTagName('a');
	if (!links.length) {
		return true;
	}
	if (
		links.length === 1 &&
		links[0].textContent === block.textContent &&
		block.textContent.toUpperCase() === block.textContent
	) {
		return false;
	}
	const trimmedContent = block.textContent.trim();
	if (config.regexBlacklist.some(regex => regex.test(trimmedContent))) {
		return false;
	}
	const singleSentenceMatch = trimmedContent.match(singleSentenceRegex);
	if (singleSentenceMatch) {
		if (recircRegex.test(trimmedContent)) {
			return false;
		}
		const lowercasedContent = trimmedContent.toLowerCase();
		return !config.singleSentenceOpenerBlacklist.some(opener => lowercasedContent.startsWith(opener));
	}
	return true;
}
function shouldSearchForContent(element: Element, config: ContainerSearchConfig) {
	if (config.nodeNameBlacklist.some(nodeName => element.nodeName === nodeName)) {
		return false;
	}
	return !config.selectorBlacklist.some(selector => element.matches(selector));
}

// find text containers by recursively walking the tree looking for text nodes
const findTextContainers = (function () {
	function findClosestTextContainerElement(lineage: Node[], config: TextContainerSelectionConfig) {
		return (
			searchUpLineage(
				lineage,
				(ancestor, index) => (
					isElement(ancestor) &&
					config.nodeNameWhitelist.includes(ancestor.nodeName) &&
					!lineage
						.slice(0, index)
						.some(ancestor => config.ancestorNodeNameBlacklist.includes(ancestor.nodeName))
				)
			) as Element
		);
	}
	function addTextNode(node: Node, lineage: Element[], config: Config, containers: TextContainer[]) {
		// add text nodes with no words to preserve whitespace in valid containers. filter containers after the
		// entire tree has been processed.
		// find the closest text container element
		const containerElement = findClosestTextContainerElement(lineage, config.textContainerSelection);
		// only process the text node if a text container was found
		if (
			containerElement &&
			!config.textContainerSearch.descendantNodeNameBlacklist.some(nodeName => !!containerElement.getElementsByTagName(nodeName).length)
		) {
			// capture lineage
			let containerLineage: Node[];
			const transpositionRule = (
				config ?
					config.transpositions.find(rule => rule.elements.some(element => element === containerElement)) :
					null
			);
			if (transpositionRule) {
				containerLineage = transpositionRule.lineage.concat(containerElement);
			} else {
				containerLineage = lineage.slice(0, lineage.indexOf(containerElement) + 1);
			}
			// create the text container and add to container array or merge with existing container
			const
				textContainer = new TextContainer(containerLineage, [(lineage as Node[]).concat(node)], getWordCount(node)),
				existingContainer = containers.find(container => container.containerElement === containerElement);
			if (existingContainer) {
				existingContainer.mergeContent(textContainer);
			} else {
				containers.push(textContainer);
			}
		}
	}
	return function (node: Node, lineage: Element[], config: Config, containers: TextContainer[] = []) {
		// guard against processing undesirable nodes
		if (
			isElement(node) &&
			(
				!lineage.length ||
				shouldSearchForContent(node, config.textContainerSearch)
			)
		) {
			// process child text nodes or element nodes
			const childLineage = lineage.concat(node);
			for (const child of node.childNodes) {
				if (child.nodeType === Node.TEXT_NODE) {
					addTextNode(child, childLineage, config, containers);
				} else {
					findTextContainers(child, childLineage, config, containers);
				}
			}
		}
		return containers;
	};
}());

function groupTextContainersByDepth(containers: TextContainer[]) {
	return containers.reduce<TextContainerDepthGroup[]>(
		(depthGroups, container) => {
			const
				containerDepth = container.containerLineage.length,
				existingGroup = depthGroups.find(group => group.depth === containerDepth);
			if (existingGroup) {
				existingGroup.add(container);
			} else {
				depthGroups.push(new TextContainerDepthGroup(containerDepth, container));
			}
			return depthGroups;
		},
		[]
	);
}

// find traversal paths between depth group members
function findTraversalPaths(group: TextContainerDepthGroup) {
	return group.members.map((member, index, members) => {
		const
			peers = members.filter(potentialPeer => potentialPeer !== member),
			paths = [
				new TraversalPath({
					hops: 0,
					frequency: 1,
					wordCount: member.wordCount
				})
			];
		for (let i = 1; i <= group.depth && peers.length; i++) {
			const 
				containerLineageIndex = group.depth - i,
				foundPeers = peers.filter(peer => peer.containerLineage[containerLineageIndex] === member.containerLineage[containerLineageIndex]);
			if (foundPeers.length) {
				paths.push(
					new TraversalPath({
						hops: i * 2,
						frequency: foundPeers.length,
						wordCount: foundPeers.reduce((sum, peer) => sum += peer.wordCount, 0)
					})
				);
				foundPeers.forEach(
					peer => {
						peers.splice(peers.indexOf(peer), 1);
					}
				);
			}
		}
		return new TraversalPathSearchResult(member, paths);
	});
}

// image processing
const findImageContainers = (function () {
	function getVisibleText(elements: Element[]) {
		for (const element of elements) {
			if (element instanceof HTMLElement) {
				const text = element.innerText.trim();
				if (text) {
					return text;
				}
			}
		}
		return null;
	}
	function addFigureContent(element: Element, config: ImageContainerContentConfig, contentElements: Node[] = []) {
		if (isValidFigureContent(element, config)) {
			contentElements.push(element);
			for (const child of element.children) {
				addFigureContent(child, config, contentElements);
			}
		}
		return contentElements;
	}
	function addImage(element: Element, lineage: Element[], config: Config, images: ImageContainer[]) {
		if (
			shouldSearchForContent(element, config.imageContainerSearch) &&
			!config.imageContainerSearch.descendantNodeNameBlacklist.some(nodeName => !!element.getElementsByTagName(nodeName).length)
		) {
			const
				imgElements = Array.from(
					element.nodeName === 'IMG' ?
						[element as HTMLImageElement] :
						element.getElementsByTagName('img')
				),
				validImgElements = imgElements.filter(element => isValidImgElement(element));
			if (!imgElements.length || validImgElements.length) {
				let containerElement: Element;
				let contentElements: Node[];
				switch (element.nodeName) {
					case 'PICTURE':
						containerElement = element;
						contentElements = Array
							.from(element.children)
							.filter(
								child => child.nodeName === 'SOURCE' || child.nodeName === 'META' || child.nodeName === 'IMG'
							);
						break;
					case 'FIGURE':
						containerElement = element;
						contentElements = [];
						for (const child of element.children) {
							addFigureContent(child, config.imageContainerContent, contentElements);
						}
						break;
					case 'IMG':
						containerElement = element;
						contentElements = [element];
						break;
				}
				const metaSearchRoot = (
					searchUpLineage(
						lineage,
						(ancestor, index) => {
							if (index === 0) {
								return false;
							}
							const parent = lineage[index - 1];
							return (
								(parent.previousElementSibling || parent.nextElementSibling) &&
								!findWordsInAttributes(parent).some(word => config.imageContainerMetadata.imageWrapperAttributeWordParts.some(part => word.includes(part)))
							);
						}
					) as Element ||
					element
				);
				images.push(
					new ImageContainer(
						containerElement ?
							lineage.concat(containerElement) :
							[],
						contentElements.map(
							child => (lineage as Node[]).concat(buildLineage({ descendant: child, ancestor: element }))
						),
						getVisibleText(findDescendantsMatchingQuerySelectors(metaSearchRoot, config.imageContainerMetadata.captionSelectors)),
						getVisibleText(findDescendantsMatchingQuerySelectors(metaSearchRoot, config.imageContainerMetadata.creditSelectors))
					)
				);
			}
		}
	}
	return function (node: Node, lineage: Element[], edge: GraphEdge, searchArea: Node[][], config: Config, images: ImageContainer[] = []) {
		if (
			isElement(node) &&
			shouldSearchForContent(node, config.imageContainerSearch)
		) {
			const childLineage = lineage.concat(node);
			findChildren(node, lineage.length, edge, searchArea).forEach(
				result => {
					if (isImageContainerElement(result.node)) {
						addImage(result.node, childLineage, config, images);
					} else {
						findImageContainers(result.node, childLineage, result.edge, searchArea, config, images);
					}
				}
			);
		}
		return images;
	};
}());

// preformatted text processing
const findPreformattedTextContainers = (
	function () {
		function createTextNodeLineages(element: Element, elementLineage: Element[], lineages: Node[][] = []) {
			for (let child of element.childNodes) {
				if (isElement(child)) {
					createTextNodeLineages(
						child,
						elementLineage.concat(child),
						lineages
					);
				} else if (child.nodeType === Node.TEXT_NODE) {
					lineages.push(
						(elementLineage as Node[]).concat(child)
					);
				}
			}
			return lineages;
		}
		return function (node: Node, lineage: Element[], edge: GraphEdge, searchArea: Node[][], containers: TextContainer[] = []) {
			if (
				isElement(node)
			) {
				const childLineage = lineage.concat(node);
				findChildren(node, lineage.length, edge, searchArea)
					.forEach(
						result => {
							if (result.node.nodeName === 'PRE') {
								const containerLineage = childLineage.concat(result.node as Element);
								containers.push(
									new TextContainer(
										containerLineage,
										createTextNodeLineages(result.node as Element, containerLineage),
										getWordCount(result.node)
									)
								);
							} else {
								findPreformattedTextContainers(result.node, childLineage, result.edge, searchArea, containers);
							}
						}
					);
			}
			return containers;
		};
	}
)();

// missing text container processing
function findAdditionalPrimaryTextContainers(
	node: Node,
	lineage: Element[],
	edge: GraphEdge,
	searchArea: Node[][],
	potentialContainers: TextContainer[],
	blacklist: Node[],
	config: TextContainerSearchConfig,
	additionalContainers: TextContainer[] = []
) {
	if (
		isElement(node) &&
		!config.additionalContentNodeNameBlacklist.includes(node.nodeName) &&
		shouldSearchForContent(node, config) &&
		!blacklist.includes(node)
	) {
		findChildren(node, lineage.length, edge, searchArea).forEach(
			result => {
				let matchingContainer: TextContainer | null;
				if (
					isElement(result.node) &&
					(matchingContainer = potentialContainers.find(container => container.containerElement === result.node))
				) {
					if (!blacklist.some(wrapper => wrapper === result.node || result.node.contains(wrapper))) {
						additionalContainers.push(matchingContainer);
					}
				} else {
					findAdditionalPrimaryTextContainers(result.node, [node, ...lineage], result.edge, searchArea, potentialContainers, blacklist, config, additionalContainers);
				}
			}
		);
	}
	return additionalContainers;
}

// safe area search
function findChildren(parent: Node, depth: number, edge: GraphEdge, searchArea: Node[][]): ChildNodeSearchResult[] {
	const children = Array.from(parent.childNodes);
	if (
		edge !== GraphEdge.None &&
		depth < searchArea.length - 1
	) {
		const childrenLineageDepthGroup = searchArea[depth + 1];
		let
			firstSearchableChildIndex: number | null,
			lastSearchableChildIndex: number | null;
		if (edge & GraphEdge.Left) {
			firstSearchableChildIndex = children.findIndex(child => childrenLineageDepthGroup.includes(child as Element));
		}
		if (edge & GraphEdge.Right) {
			lastSearchableChildIndex = (
				children.length -
				1 -
				children
					.reverse()
					.findIndex(child => childrenLineageDepthGroup.includes(child as Element))
			);
			children.reverse();
		}
		return children
			.filter(
				(_, index) =>
					(
						firstSearchableChildIndex != null ?
							index >= firstSearchableChildIndex :
							true
					) &&
					(
						lastSearchableChildIndex != null ?
							index <= lastSearchableChildIndex :
							true
					)
			)
			.map((child, index, children) => {
				let childEdge = GraphEdge.None;
				if (edge & GraphEdge.Left && index === 0) {
					childEdge |= GraphEdge.Left;
				}
				if (edge & GraphEdge.Right && index === children.length - 1) {
					childEdge |= GraphEdge.Right;
				}
				return {
					node: child,
					edge: childEdge
				};
			});
	}
	return children.map(
		child => ({
			node: child,
			edge: GraphEdge.None
		})
	);
}

export default function parseDocumentContent(): ParseResult {
	const publisherConfig = findPublisherConfig(configs.publishers, window.location.hostname);

	let contentSearchRootElement: Element;
	if (publisherConfig && publisherConfig.contentSearchRootElementSelector) {
		contentSearchRootElement = document.querySelector(publisherConfig.contentSearchRootElementSelector);
	}
	if (!contentSearchRootElement) {
		contentSearchRootElement = document.body;
	}

	const config = new Config(configs.universal, publisherConfig, contentSearchRootElement);

	const blacklistedTextContainerElements = selectElements(config.textContainerFilter.blacklistSelectors);

	let textContainers = findTextContainers(contentSearchRootElement, [], config)
		.filter(
			container => (
				container.wordCount > 0 &&
				!blacklistedTextContainerElements.some(element => element === container.containerElement) &&
				isTextContentValid(container.containerElement, config.textContainerFilter)
			)
		);
	const attributeFilteredTextContainers = textContainers.filter(container => areContainerAttributesValid(container.containerElement, config.textContainerFilter));
	if (attributeFilteredTextContainers.length / textContainers.length > 0.5) {
		textContainers = attributeFilteredTextContainers;
	}

	const textContainerDepthGroups = groupTextContainersByDepth(textContainers);

	const depthGroupWithMostWords = textContainerDepthGroups.sort((a, b) => b.wordCount - a.wordCount)[0];

	const traversalPathSearchResults = findTraversalPaths(depthGroupWithMostWords);

	const preferredPathHopCountGroups = traversalPathSearchResults.reduce<{
		preferredPathHopCount: number,
		searchResults: TraversalPathSearchResult[],
		wordCount: number
	}[]>(
		(groups, result) => {
			const group = groups.find(group => group.preferredPathHopCount === result.getPreferredPath().hops);
			if (group) {
				group.searchResults.push(result);
				group.wordCount += result.textContainer.wordCount;
			} else {
				groups.push({
					preferredPathHopCount: result.getPreferredPath().hops,
					searchResults: [result],
					wordCount: result.textContainer.wordCount
				});
			}
			return groups;
		},
		[]
	);

	const selectedPreferredPathHopCountGroups = preferredPathHopCountGroups
		.sort((a, b) => b.wordCount - a.wordCount)
		.reduce<{
			preferredPathHopCount: number,
			searchResults: TraversalPathSearchResult[],
			wordCount: number
		}[]>(
			(selectedGroups, group) => {
				if (selectedGroups.reduce((sum, group) => sum + group.wordCount, 0) < depthGroupWithMostWords.wordCount * config.wordCountTraversalPathSearchLimitMultiplier) {
					selectedGroups.push(group);
				}
				return selectedGroups;
			},
			[]
		);

	let primaryTextContainerSearchResults = selectedPreferredPathHopCountGroups.reduce<TraversalPathSearchResult[]>(
		(results, group) => results.concat(group.searchResults), []
	);

	const excludedSearchResults = traversalPathSearchResults.filter(
		result => !primaryTextContainerSearchResults.includes(result)
	);
	if (excludedSearchResults.length) {
		const primaryTextContainerElementMetadata = primaryTextContainerSearchResults
			.reduce<{
				nodeName: string,
				searchResults: TraversalPathSearchResult[],
				wordCount: number
			}[]>(
				(groups, result) => {
					const group = groups.find(group => group.nodeName === result.textContainer.containerElement.nodeName);
					if (group) {
						group.searchResults.push(result);
						group.wordCount += result.textContainer.wordCount;
					} else {
						groups.push({
							nodeName: result.textContainer.containerElement.nodeName,
							searchResults: [result],
							wordCount: result.textContainer.wordCount
						});
					}
					return groups;
				},
				[]
			)
			.sort(
				(a, b) => b.wordCount - a.wordCount
			)[0];
		if (primaryTextContainerElementMetadata.nodeName === 'P') {
			primaryTextContainerSearchResults = primaryTextContainerSearchResults.concat(
				excludedSearchResults.filter(
					result => result.textContainer.containerElement.nodeName === primaryTextContainerElementMetadata.nodeName
				)
			);
		}
	}

	const primaryTextRootNode = primaryTextContainerSearchResults[0].textContainer.containerLineage[primaryTextContainerSearchResults[0].textContainer.containerLineage.length - Math.max((Math.max(...primaryTextContainerSearchResults.map(result => result.getPreferredPath().hops)) / 2), 1)] as Element;

	const searchArea = zipContentLineages(primaryTextContainerSearchResults.map(result => result.textContainer))
		.slice(
			buildLineage({
					ancestor: contentSearchRootElement,
					descendant: primaryTextRootNode
				})
				.length - 1
		);

	const blacklistedImageContainerElements = selectElements(config.imageContainerFilter.blacklistSelectors);

	const imageContainers = findImageContainers(
			primaryTextRootNode,
			[],
			GraphEdge.Left | GraphEdge.Right,
			searchArea,
			config
		)
		.filter(
			container => (
				!blacklistedImageContainerElements.some(element => element === container.containerElement) &&
				areContainerAttributesValid(container.containerElement, config.imageContainerFilter) &&
				isImageContainerMetadataValid(container, config.imageContainerMetadata)
			)
		);

	const preformattedTextContainers = findPreformattedTextContainers(
		primaryTextRootNode,
		[],
		GraphEdge.Left | GraphEdge.Right,
		searchArea
	);

	const additionalPrimaryTextContainers = findAdditionalPrimaryTextContainers(
			primaryTextRootNode,
			[],
			GraphEdge.Left | GraphEdge.Right,
			searchArea,
			textContainerDepthGroups
				.filter(
					group => (
						group.depth !== depthGroupWithMostWords.depth &&
						group.depth >= depthGroupWithMostWords.depth - config.textContainerSearch.additionalContentMaxDepthDecrease &&
						group.depth <= depthGroupWithMostWords.depth + config.textContainerSearch.additionalContentMaxDepthIncrease
					)
				)
				.reduce<TextContainer[]>((containers, group) => containers.concat(group.members), [])
				.concat(
					traversalPathSearchResults
						.filter(result => !primaryTextContainerSearchResults.includes(result))
						.map(result => result.textContainer)
				),
			imageContainers.map(container => container.containerElement),
			config.textContainerSearch
		)
		.filter(container => isTextContentValid(container.containerElement, config.textContainerFilter));

	return {
		contentSearchRootElement,
		depthGroupWithMostWords,
		primaryTextContainerSearchResults,
		additionalPrimaryTextContainers,
		primaryTextRootNode,
		primaryTextContainers: primaryTextContainerSearchResults
			.map(result => result.textContainer)
			.concat(additionalPrimaryTextContainers),
		imageContainers,
		preformattedTextContainers
	};
}