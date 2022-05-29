// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import TranspositionConfig from './TranspositionConfig';
import PublisherContainerSearchConfig from './PublisherContainerSearchConfig';
import { LazyImageStrategy } from '../processLazyImages';
import PublisherContainerFilterConfig from './PublisherContainerFilterConfig';

export function findPublisherConfig(configs: PublisherConfig[], hostname: string) {
	return configs.find(config => hostname.endsWith(config.hostname));
}
export default interface PublisherConfig {
	hostname: string,
	preprocessor?: () => void,
	contentSearchRootElementSelector?: string,
	transpositions?: TranspositionConfig[],
	textContainerSearch?: PublisherContainerSearchConfig,
	textContainerFilter?: PublisherContainerFilterConfig,
	imageContainerSearch?: PublisherContainerSearchConfig,
	imageContainerFilter?: PublisherContainerFilterConfig,
	imageStrategy?: LazyImageStrategy
}