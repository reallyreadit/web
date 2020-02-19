import CommunityReadSort from '../CommunityReadSort';
import CommunityReadTimeWindow from '../CommunityReadTimeWindow';

export default interface CommunityReadsQuery {
	maxLength: number | null,
	minLength: number | null,
	pageNumber: number,
	pageSize: number,
	sort: CommunityReadSort,
	timeWindow?: CommunityReadTimeWindow
}