
export enum ExtensionOptionKey {
	StarOnSave = 'extOptionStarOnSave'
}

export interface ExtensionOptions {
	[ExtensionOptionKey.StarOnSave]: boolean
}

// When querying the Storage API using key/value pairs default values can be specified.
export const extensionOptionsStorageQuery = {
	[ExtensionOptionKey.StarOnSave]: true
};