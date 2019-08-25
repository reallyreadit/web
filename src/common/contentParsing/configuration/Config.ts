import UniversalConfig from './UniversalConfig';
import PublisherConfig from './PublisherConfig';
import TextContainerSearchConfig from './TextContainerSearchConfig';
import TextContainerContentConfig from './TextContainerContentConfig';
import ImageContainerMetadataConfig from './ImageContainerMetadataConfig';
import TextContainerSelectionConfig from './TextContainerSelectionConfig';
import TranspositionRule from './TranspositionRule';
import ContainerSearchConfig from './ContainerSearchConfig';
import ImageContainerContentConfig from './ImageContainerContentConfig';
import { buildLineage } from '../utils';
import { LazyImageStrategy } from '../processLazyImages';

export default class Config {
	private readonly _textContainerSearch: TextContainerSearchConfig;
	private readonly _textContainerContent: TextContainerContentConfig;
	private readonly _imageContainerSearch: ContainerSearchConfig;
	private readonly _imageContainerMetadata: ImageContainerMetadataConfig;
	private readonly _imageContainerContent: ImageContainerContentConfig;
	private readonly _textContainerSelection: TextContainerSelectionConfig;
	private readonly _contentSearchRootElementSelector: string | null;
	private readonly _transpositions: TranspositionRule[];
	private readonly _wordCountTraversalPathSearchLimitMultiplier: number;
	private readonly _imageStrategy: LazyImageStrategy | null;
	constructor(universal: UniversalConfig, publisher: PublisherConfig | null, contentSearchRootElement: Element) {
		this._textContainerContent = universal.textContainerContent;
		this._imageContainerMetadata = universal.imageContainerMetadata;
		this._imageContainerContent = universal.imageContainerContent;
		this._textContainerSelection = universal.textContainerSelection;
		this._wordCountTraversalPathSearchLimitMultiplier = universal.wordCountTraversalPathSearchLimitMultiplier;
		if (publisher) {
			if (publisher.textContainerSearch) {
				this._textContainerSearch = {
					...universal.textContainerSearch,
					attributeFullWordBlacklist: universal.textContainerSearch.attributeFullWordBlacklist.concat(publisher.textContainerSearch.attributeFullWordBlacklist || []),
					attributeFullWordWhitelist: publisher.textContainerSearch.attributeFullWordWhitelist || [],
					classBlacklist: publisher.textContainerSearch.classBlacklist || []
				};
			} else {
				this._textContainerSearch = {
					...universal.textContainerSearch,
					attributeFullWordWhitelist: [],
					classBlacklist: []
				};
			}
			if (publisher.imageContainerSearch) {
				this._imageContainerSearch = {
					...universal.imageContainerSearch,
					attributeFullWordBlacklist: universal.imageContainerSearch.attributeFullWordBlacklist.concat(publisher.imageContainerSearch.attributeFullWordBlacklist || []),
					attributeFullWordWhitelist: publisher.imageContainerSearch.attributeFullWordWhitelist || [],
					classBlacklist: publisher.imageContainerSearch.classBlacklist || []
				};
			} else {
				this._imageContainerSearch = {
					...universal.imageContainerSearch,
					attributeFullWordWhitelist: [],
					classBlacklist: []
				};
			}
			this._contentSearchRootElementSelector = publisher.contentSearchRootElementSelector;
			if (publisher.transpositions) {
				this._transpositions = publisher.transpositions
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
			} else {
				this._transpositions = [];
			}
			this._imageStrategy = publisher.imageStrategy;
		} else {
			this._textContainerSearch = {
				...universal.textContainerSearch,
				attributeFullWordWhitelist: [],
				classBlacklist: []
			};
			this._imageContainerSearch = {
				...universal.imageContainerSearch,
				attributeFullWordWhitelist: [],
				classBlacklist: []
			};
			this._transpositions = [];
		}
	}
	public get textContainerSearch() {
		return this._textContainerSearch;
	}
	public get textContainerContent() {
		return this._textContainerContent;
	}
	public get imageContainerSearch() {
		return this._imageContainerSearch;
	}
	public get imageContainerMetadata() {
		return this._imageContainerMetadata;
	}
	public get imageContainerContent() {
		return this._imageContainerContent;
	}
	public get textContainerSelection() {
		return this._textContainerSelection;
	}
	public get contentSearchRootElementSelector() {
		return this._contentSearchRootElementSelector;
	}
	public get transpositions() {
		return this._transpositions;
	}
	public get wordCountTraversalPathSearchLimitMultiplier() {
		return this._wordCountTraversalPathSearchLimitMultiplier;
	}
	public get imageStrategy() {
		return this._imageStrategy;
	}
}