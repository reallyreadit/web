export default interface Fetchable<T> {
	isLoading: boolean,
	value?: T,
	errors?: string[]
}