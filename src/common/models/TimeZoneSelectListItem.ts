export default interface TimeZoneSelectListItem {
	key: string,
	value: {
		id: number,
		territory: string,
		name: string
	}[]
}