import ReadingTimeTotalsRow from './ReadingTimeTotalsRow';

export default interface ReadingTimeStats {
	rows: ReadingTimeTotalsRow[],
	userReadCount: number
}