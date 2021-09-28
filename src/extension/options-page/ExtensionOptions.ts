
export enum ExtensionOptionKey {
	StarOnSave = 'extOptionStarOnSave'
}

export interface ExtensionOptions {
	[ExtensionOptionKey.StarOnSave]: boolean
}
