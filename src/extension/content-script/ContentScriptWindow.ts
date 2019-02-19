import Page from '../../common/reading/Page';
import LazyScript from './LazyScript';
import { ContentParseResult, ParseMode } from '../../common/reading/parseDocumentContent';
import { Props as UserInterfaceProps } from './user-interface/main';

declare global {
	interface ContentScriptWindow {
		contentParser: LazyScript<{
			parse: (mode: ParseMode) => ContentParseResult
		}>,
		userInterface: LazyScript<{
			construct: (page: Page, props: UserInterfaceProps) => void,
			destruct: () => void,
			isConstructed: () => boolean,
			update: (props: Partial<UserInterfaceProps>) => void
		}>
	}
}