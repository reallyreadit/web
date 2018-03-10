export function truncateText(text: string, length: number) {
	if (!text) {
		return text;
	}
	return text.length > length ? text.substring(0, length) + '...' : text;
}
export function formatTimestamp(timestamp: string) {
	if (!timestamp || timestamp.length < 10) {
		return timestamp;
	}
	return (
		parseInt(timestamp.substr(5, 2)) + '/' +
		parseInt(timestamp.substr(8, 2)) + '/' +
		timestamp.substr(2, 2)
	);
}
export function getArticleUrlPath(slug: string) {
	if (!slug) {
		return slug;
	}
	const slugParts = slug.split('_');
	return `/articles/${slugParts[0]}/${slugParts[1]}`;
}