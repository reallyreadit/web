import { MetadataParseResult } from './parseDocumentMetadata';
import ParseResult from '../contentParsing/ParseResult';

export default function createPageParseResult(
	metadata: MetadataParseResult,
	content: ParseResult
) {
	const wordCount = content.primaryTextContainers.reduce((sum, el) => sum + el.wordCount, 0);
	return {
		...metadata.metadata,
		wordCount,
		readableWordCount: wordCount,
		article: {
			...metadata.metadata.article,
			description: metadata.metadata.article.description
		}
	};
}