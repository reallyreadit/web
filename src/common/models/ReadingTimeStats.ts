import ReadingTimeTotalsRow from './ReadingTimeTotalsRow';
import UserStats from './UserStats';

export default interface ReadingTimeStats {
	rows: ReadingTimeTotalsRow[],
	userStats?: UserStats
}