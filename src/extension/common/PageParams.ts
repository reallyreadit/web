interface PageParams {
	element: Element,
	url: string,
	blockElements: Element[] | NodeListOf<Element>,
	number: number,
	pageLinks: string[]
}
export default PageParams;