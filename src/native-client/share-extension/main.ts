import WebViewMessagingContext from '../../common/WebViewMessagingContext';
import parseDocumentMetadata from '../../common/reading/parseDocumentMetadata';
import createPageParseResult from '../../common/reading/createPageParseResult';
import parseDocumentContent from '../../common/contentParsing/parseDocumentContent';

new WebViewMessagingContext().sendMessage({
	type: 'parseResult',
	data: createPageParseResult(
		parseDocumentMetadata(),
		parseDocumentContent({
			url: window.location
		})
	)
});