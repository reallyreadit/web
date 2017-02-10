interface Fetchable<T> {
	isLoading: boolean,
	isSuccessful?: boolean,
	value?: T,
	errors?: string[]
}
export default Fetchable;