import CommunityReadSort from '../CommunityReadSort';

export default interface CommunityReadsQuery {
	maxLength: number | null,
	minLength: number | null,
	pageNumber: number,
	pageSize: number,
	sort: CommunityReadSort
}