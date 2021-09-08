import { ProblemDetails } from '../../common/ProblemDetails';

export enum NativeMessageType {
	ReadArticle = 'readArticle'
}
export interface ReadArticleNativeMessage {
	type: NativeMessageType.ReadArticle,
	data: {
		url: string,
		star: boolean
	}
}
export interface NativeMessageResponseBase {
	version: string
}
export interface NativeMessageSuccessResponse extends NativeMessageResponseBase {
	succeeded: true
}
export interface NativeMessageErrorResponse extends NativeMessageResponseBase {
	succeeded: false,
	error: ProblemDetails
}
export type NativeMessageResponse = NativeMessageSuccessResponse | NativeMessageErrorResponse;