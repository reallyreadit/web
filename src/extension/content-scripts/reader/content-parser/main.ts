import parseDocumentContent from "../../../../common/contentParsing/parseDocumentContent";
import pruneDocument from "../../../../common/contentParsing/pruneDocument";
import ParseResult from "../../../../common/contentParsing/ParseResult";

window.reallyreadit.readerContentScript.contentParser.set({
	parse: () => {
		return parseDocumentContent();
	},
	prune: (parseResult: ParseResult) => {
		pruneDocument(parseResult);
	}
});