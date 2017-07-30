interface PageResult<T> {
	items: T[],
	totalCount: number,
	pageNumber: number,
	pageSize: number,
	pageCount: number
}
export default PageResult;