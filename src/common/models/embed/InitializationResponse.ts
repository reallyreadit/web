import UserAccount from '../UserAccount';
import UserArticle from '../UserArticle';

export enum InitializationAction {
	Activate = 0,
	Deactivate = 1
}
export type InitializationResponse = InitializationActivationResponse | InitializationDeactivationResponse;
export interface InitializationDeactivationResponse {
	action: InitializationAction.Deactivate
}
export interface InitializationActivationResponse {
	action: InitializationAction.Activate,
	article: UserArticle,
	user: UserAccount,
	userArticle: {
		articleId: number,
		dateCompleted: string | null,
		dateCreated: string,
		lastModified: string | null,
		readableWordCount: number,
		readState: number[],
		wordsRead: number
	}
}