export interface AuthorAssignmentRequest {
	articleSlug: string,
	authorName: string
}
export interface AuthorUnassignmentRequest {
	articleSlug: string,
	authorSlug: string
}