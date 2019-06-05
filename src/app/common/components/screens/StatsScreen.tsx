import * as React from 'react';
import Fetchable from '../../../../common/Fetchable';
import LoadingOverlay from '../controls/LoadingOverlay';
import ScreenContainer from '../ScreenContainer';
import ReadingTimeTotalsRow from '../../../../common/models/ReadingTimeTotalsRow';
import ReadingTimeTotalsTimeWindow from '../../../../common/models/ReadingTimeTotalsTimeWindow';
import { FetchFunctionWithParams } from '../../serverApi/ServerApi';
import AsyncTracker from '../../../../common/AsyncTracker';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DateTime } from 'luxon';
import SelectList from '../../../../common/components/SelectList';

interface ReadingTimeStats {
	dataset: {
		xLabel: string,
		timeReading: number,
		timeReadingToCompletion: number
	}[],
	yLabel: string
}
interface Props {
	onGetReadingTimeStats: FetchFunctionWithParams<{ timeWindow: ReadingTimeTotalsTimeWindow }, ReadingTimeTotalsRow[]>
}
interface State {
	componentDidMount: boolean,
	isScreenLoading: boolean,
	stats: Fetchable<ReadingTimeStats>,
	timeWindow: ReadingTimeTotalsTimeWindow
}
function formatReadingTime(interval: 'month' | 'day', minutes: number) {
	return (
		interval === 'day' ?
			minutes :
			minutes / 60
	);
}
function mapReadingTimeTotalRows(timeWindow: ReadingTimeTotalsTimeWindow, rows: Fetchable<ReadingTimeTotalsRow[]>) {
	let value: ReadingTimeStats | undefined;
	if (rows.value) {
		const interval = (
			(
				timeWindow === ReadingTimeTotalsTimeWindow.AllTime ||
				timeWindow === ReadingTimeTotalsTimeWindow.PastYear
			) ?
				'month' :
				'day'
		),
			dateFormat = (
				timeWindow === ReadingTimeTotalsTimeWindow.PastWeek ?
					'ccc' :
					timeWindow === ReadingTimeTotalsTimeWindow.PastMonth ?
						'L/d' :
						DateTime.fromISO(rows.value[0].date).year === DateTime.fromISO(rows.value[rows.value.length - 1].date).year ?
							'LLL' :
							'LLL yy'
			);
		value = {
			dataset: rows.value.map(
				row => ({
					xLabel: DateTime
						.fromISO(row.date)
						.toFormat(dateFormat),
					timeReading: formatReadingTime(interval, row.minutesReading),
					timeReadingToCompletion: formatReadingTime(interval, row.minutesReadingToCompletion)
				})
			),
			yLabel: interval === 'day' ? 'Minutes' : 'Hours'
		};
	}
	return {
		...rows,
		value
	};
}
class StatsScreen extends React.Component<Props, State> {
	private readonly _asyncTracker = new AsyncTracker();
	private readonly _changeReadingTimeWindow = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const timeWindow = parseInt(event.target.value, 10) as ReadingTimeTotalsTimeWindow;
		this.setState({
			stats: this.fetchStats(timeWindow),
			timeWindow: timeWindow
		});
	};
	private readonly _formatToolTip = (value: number) => {
		return (
			parseFloat(value.toFixed(1)) +
			' ' +
			(
				(
					this.state.timeWindow === ReadingTimeTotalsTimeWindow.PastWeek ||
					this.state.timeWindow === ReadingTimeTotalsTimeWindow.PastMonth
				) ?
					'm' :
					'h'
			)
		);
	}
	private readonly _showToolTip = () => {
		// need to have an onClick handler in order for touch events to display tooltips
	};
	constructor(props: Props) {
		super(props);
		const
			readingTimeWindow = ReadingTimeTotalsTimeWindow.PastWeek,
			stats = this.fetchStats(readingTimeWindow);
		this.state = {
			componentDidMount: false,
			isScreenLoading: stats.isLoading,
			stats,
			timeWindow: readingTimeWindow
		};
	}
	private fetchStats(timeWindow: ReadingTimeTotalsTimeWindow) {
		return mapReadingTimeTotalRows(
			timeWindow,
			this.props.onGetReadingTimeStats(
				{ timeWindow },
				this._asyncTracker.addCallback(
					readingTimeTotals => {
						this.setState({
							isScreenLoading: false,
							stats: mapReadingTimeTotalRows(timeWindow, readingTimeTotals)
						});
					}
				)
			)
		);
	}
	public componentDidMount() {
		this.setState({
			componentDidMount: true
		});
	}
	public componentWillUnmount() {
		this._asyncTracker.cancelAll();
	}
	public render() {
		return (
			<ScreenContainer className="stats-screen_mqbxl8">
				{!this.state.componentDidMount || this.state.isScreenLoading ?
					<LoadingOverlay position="absolute" /> :
					<div className="reading-time">
						<form autoComplete="off">
							<span className="title">Time Spent Reading</span>
							<SelectList
								onChange={this._changeReadingTimeWindow}
								options={[
									{
										key: 'All Time',
										value: ReadingTimeTotalsTimeWindow.AllTime
									},
									{
										key: 'Past Week',
										value: ReadingTimeTotalsTimeWindow.PastWeek
									},
									{
										key: 'Past Month',
										value: ReadingTimeTotalsTimeWindow.PastMonth
									},
									{
										key: 'Past Year',
										value: ReadingTimeTotalsTimeWindow.PastYear
									}
								]}
								value={this.state.timeWindow}
							/>
						</form>
						{this.state.stats.isLoading ?
							<div className="loading-container">
								<LoadingOverlay position="absolute" />
							</div> :
							<div className="chart">
								<ResponsiveContainer aspect={2}>
									<AreaChart
										data={this.state.stats.value.dataset}
										margin={{ top: 10, right: 10, left: 10 }}
										onClick={this._showToolTip}
									>
										<Area
											dataKey="timeReading"
											fill="#c3d7ef"
											name="Total"
											stroke="#9bbde4"
											type="monotone"
										/>
										<Area
											dataKey="timeReadingToCompletion"
											fill="#73a3d9"
											name="To Completion"
											stroke="#4b88ce"
											type="monotone"
										/>
										<XAxis
											dataKey="xLabel"
											minTickGap={1}
										/>
										<YAxis
											minTickGap={1}
											width={30}
										/>
										<Tooltip formatter={this._formatToolTip} />
									</AreaChart>
								</ResponsiveContainer>
								<div className="y-label">{this.state.stats.value.yLabel}</div>
							</div>}
						<ol className="key">
							<li>Total</li>
							<li>To Completion</li>
						</ol>
					</div>}
			</ScreenContainer>
		);
	}
}
export function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	deps: Props
) {
	return {
		create: () => ({ key, title: 'Stats' }),
		render: () => (
			<StatsScreen {...deps} />
		)
	};
}