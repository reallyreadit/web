import TextContainerDepthGroup from './TextContainerDepthGroup';
import TraversalPathSearchResult from './TraversalPathSearchResult';
import TextContainer from './TextContainer';
import ImageContainer from './ImageContainer';

export default interface ParseResult {
	contentSearchRootElement: Element,
	depthGroupWithMostWords: TextContainerDepthGroup,
	primaryTextContainerSearchResults: TraversalPathSearchResult[],
	additionalPrimaryTextContainers: TextContainer[],
	primaryTextRootNode: Element,
	primaryTextContainers: TextContainer[],
	imageContainers: ImageContainer[],
	preformattedTextContainers: TextContainer[]
}