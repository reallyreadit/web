// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import ImageContainerMetadataConfig from './ImageContainerMetadataConfig';
import TextContainerSelectionConfig from './TextContainerSelectionConfig';
import ImageContainerContentConfig from './ImageContainerContentConfig';
import TextContainerFilterConfig from './TextContainerFilterConfig';
import ContainerSearchConfig from './ContainerSearchConfig';
import TextContainerSearchConfig from './TextContainerSearchConfig';
import UniversalContainerFilterConfig from './UniversalContainerFilterConfig';

export default interface UniversalConfig {
	textContainerSearch: TextContainerSearchConfig;
	textContainerFilter: TextContainerFilterConfig;
	imageContainerSearch: ContainerSearchConfig;
	imageContainerFilter: UniversalContainerFilterConfig;
	imageContainerMetadata: ImageContainerMetadataConfig;
	imageContainerContent: ImageContainerContentConfig;
	textContainerSelection: TextContainerSelectionConfig;
	wordCountTraversalPathSearchLimitMultiplier: number;
}
