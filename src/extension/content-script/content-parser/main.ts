import parseDocumentContent from "../../../common/contentParsing/parseDocumentContent";
import pruneDocument from "../../../common/contentParsing/pruneDocument";
import ParseResult from "../../../common/contentParsing/ParseResult";

window.reallyreadit.extension.contentScript.contentParser.set({
	parse: () => {
		return parseDocumentContent();
	},
	prune: (parseResult: ParseResult) => {
		pruneDocument(parseResult);
	}
});