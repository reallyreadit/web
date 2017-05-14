interface Fetchable<T> {
	isLoading: boolean,
	value?: T,
	errors?: string[]
}
export default Fetchable;