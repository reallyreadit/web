import SourceRule from '../../common/models/SourceRule';
import { ParseMode } from '../../common/reading/parseDocumentContent';

export default interface ContentScriptInitData {
	loadPage: boolean,
	parseMode: ParseMode,
	showOverlay: boolean,
	sourceRules: SourceRule[]
}