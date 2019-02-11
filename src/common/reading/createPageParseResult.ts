import { MetadataParseResult } from './parseDocumentMetadata';
import { ContentParseResult } from './parseDocumentContent';

export default function createPageParseResult(
	metadata: MetadataParseResult,
	content: ContentParseResult
) {
	return {
		...metadata.metadata,
		wordCount: content.wordCount,
		readableWordCount: content.elements.reduce((sum, el) => sum + el.wordCount, 0),
		article: {
			...metadata.metadata.article,
			description: metadata.metadata.article.description || content.excerpt
		}
	};
}