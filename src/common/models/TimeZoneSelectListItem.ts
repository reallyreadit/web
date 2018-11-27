export interface TimeZoneSelectListItemValue {
	id: number,
	territory: string,
	name: string
}
export default interface TimeZoneSelectListItem {
	key: string,
	value: TimeZoneSelectListItemValue[]
}