interface PageParams {
	element: Element,
	title: string,
	url: string,
	blockElements: Element[] | NodeListOf<Element> | HTMLCollection,
	number: number,
	pageLinks: string[]
}
export default PageParams;