import TextContainerDepthGroup from './TextContainerDepthGroup';
import PublisherConfig from './PublisherConfig';
import TraversalPathSearchResult from './TraversalPathSearchResult';
import TraversalPath from './TraversalPath';
import ImageContainer from './ImageContainer';
import GraphEdge from './GraphEdge';
import TextContainer from './TextContainer';
import ChildNodeSearchResult from './ChildNodeSearchResult';
import { zipContentLineages, buildLineage, isElement, isImageContainerElement, findWordsInAttributes, isValidImgElement } from './utils';
import ParseResult from './ParseResult';
import { isValidContent as isValidFigureContent } from './figureContent';
import SerializedPublisherConfig from './SerializedPublisherConfig';

// misc
function findDescendantsMatchingQuerySelectors(element: Element, selectors: string[]) {
	return selectors
		.map(selector => element.querySelectorAll(selector))
		.reduce<Element[]>((elements, element) => elements.concat(Array.from(element)), []);
}
const getWordCount = (function () {
	const wordRegex = /\S+/g;
	return function (node: Node) {
		return (node.textContent.match(wordRegex) || []).length;
	};
}());
function searchUpLineage(lineage: Node[], test: (node: Node, index: number) => boolean) {
	for (let i = lineage.length - 1; i >= 0; i--) {
		const ancestor = lineage[i];
		if (test(ancestor, i)) {
			return ancestor;
		}
	}
	return null;
}

// filtering
const shouldSearchForText = (function () {
	const
		nodeNameBlacklist = ['BUTTON', 'FIGURE', 'FORM', 'HEAD', 'IFRAME', 'NAV', 'NOSCRIPT', 'PICTURE', 'SCRIPT', 'STYLE'],
		fullWordBlacklist = ['ad', 'carousel', 'gallery', 'related', 'share', 'subscribe', 'subscription'],
		wordpartBlacklist = ['byline', 'caption', 'comment', 'download', 'interlude', 'image', 'meta', 'newsletter', 'photo', 'promo', 'pullquote', 'recirc', 'video'],
		itempropValueBlacklist = ['datePublished'];
	return function (element: Element, config: PublisherConfig | null) {
		if (nodeNameBlacklist.includes(element.nodeName)) {
			return false;
		}
		if (itempropValueBlacklist.includes(element.getAttribute('itemprop'))) {
			return false;
		}
		const words = findWordsInAttributes(element);
		if (words.some(word => fullWordBlacklist.includes(word) || wordpartBlacklist.some(wordPart => word.includes(wordPart)))) {
			if (config) {
				return words.some(word => config.textSearchAttributeWhitelist.includes(word));	
			}
			return false;
		}
		return true;
	}
})();
const isTextContentValid = (function () {
	const bracketedContentRegex = /^\[[^\]]+\]$/;
	const singleSentenceRegex = /^[^.!?]+[.!?'"]*$/;
	const singleSentenceOpenerBlacklist = ['►', 'click here', 'listen to this story', 'read more', 'related article:', 'sign up for', 'sponsored:', 'this article appears in', 'watch:'];
	return function (block: Element) {
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
		if (bracketedContentRegex.test(trimmedContent)) {
			return false;
		}
		const singleSentenceMatch = trimmedContent.match(singleSentenceRegex);
		if (singleSentenceMatch) {
			const lowercasedContent = trimmedContent.toLowerCase();
			return !singleSentenceOpenerBlacklist.some(opener => lowercasedContent.startsWith(opener));
		}
		return true;
	};
}());
const shouldSearchForImage = (function () {
	const
		nodeNameBlacklist = ['FORM', 'HEAD', 'IFRAME', 'NAV', 'NOSCRIPT', 'SCRIPT', 'STYLE'],
		fullWordBlacklist = ['ad', 'related', 'share', 'subscribe', 'subscription'],
		wordpartBlacklist = ['interlude', 'newsletter', 'promo', 'recirc', 'video'];
	return function (element: Element, config: PublisherConfig | null) {
		let customFullWordBlacklist = fullWordBlacklist;
		if (config) {
			customFullWordBlacklist = customFullWordBlacklist.concat(config.imageSearchAttributeBlacklist);
		}
		return !(
			nodeNameBlacklist.includes(element.nodeName) ||
			findWordsInAttributes(element)
				.some(word => customFullWordBlacklist.includes(word) || wordpartBlacklist.some(wordPart => word.includes(wordPart)))
		);
	};
}());
const isImageContainerMetadataValid = (function () {
	const textContentBlacklistRegex = /audm/i;
	return function (image: ImageContainer) {
		return (
			(!image.caption || !textContentBlacklistRegex.test(image.caption)) &&
			(!image.credit || !textContentBlacklistRegex.test(image.credit))
		);
	};
}());

// publisher configuration
const serializedPublisherConfigs: SerializedPublisherConfig[] = [
	{
		hostname: 'article-test.dev.readup.com',
		transpositions: [
			{
				elementSelectors: [
					'.lead'
				],
				parentElementSelector: '.lead + div'
			}
		],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: []
	},
	{
		hostname: 'churchofjesuschrist.org',
		transpositions: [
			{
				elementSelectors: [
					'.body-block > p',
					'.body-block > section:first-of-type > header > h2'
				],
				parentElementSelector: '.body-block > section:first-of-type'
			}
		],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: []
	},
	{
		hostname: 'cnn.com',
		transpositions: [
			{
				elementSelectors: [
					'.el__leafmedia--sourced-paragraph > .zn-body__paragraph',
					'.l-container > .zn-body__paragraph:not(.zn-body__footer)',
					'.l-container > .zn-body__paragraph > h3'
				],
				parentElementSelector: '.zn-body__read-all'
			}
		],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: []
	},
	{
		hostname: 'huffpost.com',
		transpositions: [
			{
				elementSelectors: [
					'#entry-text [data-rapid-subsec="paragraph"] > :not([data-rapid-subsec="paragraph"])'
				],
				parentElementSelector: '#entry-text'
			}
		],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: []
	},
	{
		hostname: 'medium.com',
		transpositions: [],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: ['ad']
	},
	{
		hostname: 'nytimes.com',
		transpositions: [
			{
				elementSelectors: [
					'.story-body-1 > .story-body-text'
				],
				parentElementSelector: '.story-body-2'	
			}
		],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: []
	},
	{
		hostname: 'sciencedaily.com',
		transpositions: [
			{
				elementSelectors: [
					'p.lead'
				],
				parentElementSelector: 'div#text'
			}
		],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: []
	},
	{
		hostname: 'theatlantic.com',
		transpositions: [],
		imageSearchAttributeBlacklist: ['callout'],
		textSearchAttributeWhitelist: []
	},
	{
		hostname: 'topic.com',
		transpositions: [],
		imageSearchAttributeBlacklist: [],
		textSearchAttributeWhitelist: ['essay']
	},
];

// select article search element based on available metadata
function selectContentSearchRootElement() {
	let queryRoot: Element = document.body;
	const articleScopes = queryRoot.querySelectorAll('[itemtype="http://schema.org/Article"], [itemtype="http://schema.org/BlogPosting"]');
	if (articleScopes.length) {
		queryRoot = articleScopes[0];
	}
	const articleBodyNodes = queryRoot.querySelectorAll('[itemprop=articleBody]');
	if (articleBodyNodes.length === 1) {
		return articleBodyNodes[0];
	}
	const articleNodes = queryRoot.querySelectorAll('article');
	if (articleNodes.length === 1) {
		return articleNodes[0];
	}
	return queryRoot;
}

// find text containers and group by depth from root node
// recursively walk the tree looking for text nodes
const findTextContainers = (function () {
	const findClosestTextContainerElement = (function () {
		const
			nodeNameWhitelist = ['ASIDE', 'BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'P', 'PRE', 'TABLE', 'UL'],
			parentNodeNameBlacklist = ['BLOCKQUOTE', 'LI', 'P'];
		return function (lineage: Node[]) {
			return (
				searchUpLineage(
					lineage,
					ancestor => (
						isElement(ancestor) &&
						nodeNameWhitelist.includes(ancestor.nodeName) &&
						!parentNodeNameBlacklist.includes(ancestor.parentElement.nodeName)
					)
				) as Element
			);
		};
	}());
	function addTextNode(node: Node, lineage: Element[], config: PublisherConfig | null, groups: TextContainerDepthGroup[]) {
		const wordCount = getWordCount(node);
		if (wordCount > 0) {
			// find the closest text container element
			const containerElement = findClosestTextContainerElement(lineage);
			// only process the text node if a text container was found
			if (
				containerElement &&
				!containerElement.getElementsByTagName('iframe').length &&
				!containerElement.getElementsByTagName('form').length
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
				// caculate depth
				const containerDepth = containerLineage.length;
				// create the text container and add to its matching depth group or create a new depth group
				const
					textContainer = new TextContainer(containerLineage, [(lineage as Node[]).concat(node)], wordCount),
					depthGroup = groups.find(group => group.depth === containerDepth);
				if (depthGroup) {
					depthGroup.add(textContainer);
				} else {
					groups.push(new TextContainerDepthGroup(containerDepth, textContainer));
				}
			}
		}
	}
	return function (node: Node, lineage: Element[], config: PublisherConfig | null, groups: TextContainerDepthGroup[] = []) {
		// guard against processing undesirable nodes
		if (
			isElement(node) &&
			(
				!lineage.length ||
				shouldSearchForText(node, config)
			)
		) {
			// process child text nodes or element nodes
			const childLineage = lineage.concat(node);
			for (const child of node.childNodes) {
				if (child.nodeType === Node.TEXT_NODE) {
					addTextNode(child, childLineage, config, groups);
				} else {
					findTextContainers(child, childLineage, config, groups);
				}
			}
		}
		return groups;
	};
}());

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
	const
		captionSelectors = ['figcaption', '[class*="caption"i]'],
		creditSelectors = ['[class*="credit"i]', '[class*="source"i]'],
		imageWrapperAttributeWords = ['image', 'img'];
	function getTextContent(elements: Element[]) {
		for (const element of elements) {
			const text = element.textContent.trim();
			if (text) {
				return text;
			}
		}
		return null;
	}
	function addFigureContent(element: Element, contentElements: Node[] = []) {
		if (isValidFigureContent(element)) {
			contentElements.push(element);
			for (const child of element.children) {
				addFigureContent(child, contentElements);
			}
		}
		return contentElements;
	}
	function addImage(element: Element, lineage: Element[], config: PublisherConfig | null, images: ImageContainer[]) {
		if (
			shouldSearchForImage(element, config) &&
			!element.getElementsByTagName('iframe').length &&
			!element.getElementsByTagName('form').length
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
							addFigureContent(child, contentElements);
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
								!findWordsInAttributes(parent).some(word => imageWrapperAttributeWords.includes(word))
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
						getTextContent(findDescendantsMatchingQuerySelectors(metaSearchRoot, captionSelectors)),
						getTextContent(findDescendantsMatchingQuerySelectors(metaSearchRoot, creditSelectors))
					)
				);
			}
		}
	}
	return function (node: Node, lineage: Element[], edge: GraphEdge, searchArea: Node[][], config: PublisherConfig | null, images: ImageContainer[] = []) {
		if (
			isElement(node) &&
			shouldSearchForImage(node, config)
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

// missing text container processing
function findAdditionalPrimaryTextContainers(
	node: Node,
	lineage: Element[],
	edge: GraphEdge,
	searchArea: Node[][],
	potentialContainers: TextContainer[],
	blacklist: Node[],
	config: PublisherConfig | null,
	additionalContainers: TextContainer[] = []
) {
	if (
		isElement(node) &&
		!['ASIDE', 'FOOTER', 'HEADER'].includes(node.nodeName) &&
		shouldSearchForText(node, config) &&
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
	let config: PublisherConfig;
	const serializedConfig = serializedPublisherConfigs.find(config => window.location.hostname.endsWith(config.hostname));
	if (serializedConfig) {
		const transpositions = serializedConfig.transpositions
			.map(
				rule => {
					const
						parentElement = document.querySelector(rule.parentElementSelector) as Element,
						elements = rule.elementSelectors.reduce<Element[]>(
							(elements, selector) => elements.concat(Array.from(document.querySelectorAll(selector))),
							[]
						);
					if (parentElement && elements.length) {
						return {
							elements,
							lineage: buildLineage({
								ancestor: contentSearchRootElement,
								descendant: parentElement
							})
						};
					} else {
						return null;
					}
				}
			)
			.filter(rule => !!rule);
		if (transpositions) {
			config = {
				...serializedConfig,
				transpositions
			};
		}
	}

	const contentSearchRootElement = selectContentSearchRootElement();

	const textContainerDepthGroups = findTextContainers(contentSearchRootElement, [], config);

	const depthGroupWithMostWords = textContainerDepthGroups.sort((a, b) => b.wordCount - a.wordCount)[0];

	const traversalPathSearchResults = findTraversalPaths(depthGroupWithMostWords);

	const primaryTextContainerSearchResults = traversalPathSearchResults
		.reduce<{
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
		)
		.sort((a, b) => b.wordCount - a.wordCount)
		.reduce<{
			preferredPathHopCount: number,
			searchResults: TraversalPathSearchResult[],
			wordCount: number
		}[]>(
			(selectedGroups, group) => {
				if (selectedGroups.reduce((sum, group) => sum + group.wordCount, 0) < depthGroupWithMostWords.wordCount * 0.75) {
					selectedGroups.push(group);
				}
				return selectedGroups;
			},
			[]
		)
		.reduce<TraversalPathSearchResult[]>((results, group) => results.concat(group.searchResults), [])
		.filter(result => isTextContentValid(result.textContainer.containerElement));

	const primaryTextRootNode = primaryTextContainerSearchResults[0].textContainer.containerLineage[primaryTextContainerSearchResults[0].textContainer.containerLineage.length - Math.max((Math.max(...primaryTextContainerSearchResults.map(result => result.getPreferredPath().hops)) / 2), 1)] as Element;

	const searchArea = zipContentLineages(primaryTextContainerSearchResults.map(result => result.textContainer))
		.slice(
			buildLineage({
					ancestor: contentSearchRootElement,
					descendant: primaryTextRootNode
				})
				.length - 1
		);

	const imageContainers = findImageContainers(
			primaryTextRootNode,
			[],
			GraphEdge.Left | GraphEdge.Right,
			searchArea,
			config
		)
		.filter(image => isImageContainerMetadataValid(image));

	const additionalPrimaryTextContainers = findAdditionalPrimaryTextContainers(
			primaryTextRootNode,
			[],
			GraphEdge.Left | GraphEdge.Right,
			searchArea,
			textContainerDepthGroups
				.filter(
					group => (
						group.depth !== depthGroupWithMostWords.depth &&
						group.depth >= depthGroupWithMostWords.depth - 1 &&
						group.depth <= depthGroupWithMostWords.depth + 1
					)
				)
				.reduce<TextContainer[]>((containers, group) => containers.concat(group.members), [])
				.concat(
					traversalPathSearchResults
						.filter(result => !primaryTextContainerSearchResults.includes(result))
						.map(result => result.textContainer)
				),
			imageContainers.map(container => container.containerElement),
			config
		)
		.filter(container => isTextContentValid(container.containerElement));

	return {
		contentSearchRootElement,
		depthGroupWithMostWords,
		primaryTextContainerSearchResults,
		additionalPrimaryTextContainers,
		primaryTextRootNode,
		primaryTextContainers: primaryTextContainerSearchResults
			.map(result => result.textContainer)
			.concat(additionalPrimaryTextContainers),
		imageContainers
	};
}