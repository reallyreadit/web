import parseDocumentContent from '../../../common/reading/parseDocumentContent';

window.reallyreadit.extension.contentScript.contentParser.set({
	parse: (mode: 'analyze' | 'mutate') => {
		return parseDocumentContent(mode);
	}
});