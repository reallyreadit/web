// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import UniversalConfig from './UniversalConfig';
import PublisherConfig from './PublisherConfig';
import TextContainerSearchConfig from './TextContainerSearchConfig';
import TextContainerFilterConfig from './TextContainerFilterConfig';
import ImageContainerMetadataConfig from './ImageContainerMetadataConfig';
import TextContainerSelectionConfig from './TextContainerSelectionConfig';
import TranspositionRule from './TranspositionRule';
import ContainerSearchConfig from './ContainerSearchConfig';
import ImageContainerContentConfig from './ImageContainerContentConfig';
import { buildLineage } from '../utils';
import { LazyImageStrategy } from '../processLazyImages';
import ContainerFilterConfig from './ContainerFilterConfig';

export default class Config {
	private readonly _textContainerSearch: TextContainerSearchConfig;
	private readonly _textContainerFilter: TextContainerFilterConfig;
	private readonly _imageContainerSearch: ContainerSearchConfig;
	private readonly _imageContainerFilter: ContainerFilterConfig;
	private readonly _imageContainerMetadata: ImageContainerMetadataConfig;
	private readonly _imageContainerContent: ImageContainerContentConfig;
	private readonly _textContainerSelection: TextContainerSelectionConfig;
	private readonly _contentSearchRootElementSelector: string | null;
	private readonly _transpositions: TranspositionRule[];
	private readonly _wordCountTraversalPathSearchLimitMultiplier: number;
	private readonly _imageStrategy: LazyImageStrategy | null;
	constructor(universal: UniversalConfig, publisher: PublisherConfig | null, contentSearchRootElement: Element) {
		this._textContainerFilter = universal.textContainerFilter;
		this._imageContainerMetadata = universal.imageContainerMetadata;
		this._imageContainerContent = universal.imageContainerContent;
		this._textContainerSelection = universal.textContainerSelection;
		this._wordCountTraversalPathSearchLimitMultiplier = universal.wordCountTraversalPathSearchLimitMultiplier;
		if (publisher) {
			if (publisher.textContainerSearch) {
				this._textContainerSearch = {
					...universal.textContainerSearch,
					selectorBlacklist: universal.textContainerSearch.selectorBlacklist.concat(publisher.textContainerSearch.selectorBlacklist || [])
				};
			} else {
				this._textContainerSearch = universal.textContainerSearch;
			}
			if (publisher.textContainerFilter) {
				this._textContainerFilter = {
					...universal.textContainerFilter,
					attributeFullWordBlacklist: universal.textContainerFilter.attributeFullWordBlacklist.concat(publisher.textContainerFilter.attributeFullWordBlacklist || []),
					attributeFullWordWhitelist: publisher.textContainerFilter.attributeFullWordWhitelist || [],
					blacklistSelectors: universal.textContainerFilter.blacklistSelectors.concat(publisher.textContainerFilter.blacklistSelectors || [])
				};
			} else {
				this._textContainerFilter = {
					...universal.textContainerFilter,
					attributeFullWordWhitelist: []
				};
			}
			if (publisher.imageContainerSearch) {
				this._imageContainerSearch = {
					...universal.imageContainerSearch,
					selectorBlacklist: universal.imageContainerSearch.selectorBlacklist.concat(publisher.imageContainerSearch.selectorBlacklist || [])
				};
			} else {
				this._imageContainerSearch = universal.imageContainerSearch;
			}
			if (publisher.imageContainerFilter) {
				this._imageContainerFilter = {
					...universal.imageContainerFilter,
					attributeFullWordBlacklist: universal.imageContainerFilter.attributeFullWordBlacklist.concat(publisher.imageContainerFilter.attributeFullWordBlacklist || []),
					attributeFullWordWhitelist: publisher.imageContainerFilter.attributeFullWordWhitelist || [],
					blacklistSelectors: universal.imageContainerFilter.blacklistSelectors.concat(publisher.imageContainerFilter.blacklistSelectors || [])
				};
			} else {
				this._imageContainerFilter = {
					...universal.imageContainerFilter,
					attributeFullWordWhitelist: []
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
			this._textContainerSearch = universal.textContainerSearch;
			this._textContainerFilter = {
				...universal.textContainerFilter,
				attributeFullWordWhitelist: []
			};
			this._imageContainerSearch = universal.imageContainerSearch;
			this._imageContainerFilter = {
				...universal.imageContainerFilter,
				attributeFullWordWhitelist: []
			};
			this._transpositions = [];
		}
	}
	public get textContainerSearch() {
		return this._textContainerSearch;
	}
	public get textContainerFilter() {
		return this._textContainerFilter;
	}
	public get imageContainerSearch() {
		return this._imageContainerSearch;
	}
	public get imageContainerFilter() {
		return this._imageContainerFilter;
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