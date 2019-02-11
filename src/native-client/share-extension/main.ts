import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import parseDocumentContent from '../../common/reading/parseDocumentContent';
import createPageParseResult from '../../common/reading/createPageParseResult';

new WebViewMessagingContext().sendMessage({
	type: 'parseResult',
	data: createPageParseResult(
		parseDocumentMetadata(),
		parseDocumentContent('analyze')
	)
});