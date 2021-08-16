import parseDocumentContent, { ParserParams } from "../../../../common/contentParsing/parseDocumentContent";
import pruneDocument from "../../../../common/contentParsing/pruneDocument";
import ParseResult from "../../../../common/contentParsing/ParseResult";

window.reallyreadit.readerContentScript.contentParser.set({
	parse: (params: ParserParams) => {
		return parseDocumentContent(params);
	},
	prune: (parseResult: ParseResult) => {
		return pruneDocument(parseResult);
	}
});