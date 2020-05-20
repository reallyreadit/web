export enum TwitterCardType {
	App,
	Summary
}
export interface TwitterAppCard {
	type: TwitterCardType.App
}
export interface TwitterSummaryCard {
	type: TwitterCardType.Summary,
	title: string,
	description: string,
	imageUrl: string | null
}
export type TwitterCard = TwitterAppCard | TwitterSummaryCard;