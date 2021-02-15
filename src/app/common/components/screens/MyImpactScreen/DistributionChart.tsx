import * as React from 'react';
import { SubscriptionDistributionReport } from '../../../../../common/models/subscriptions/SubscriptionDistributionReport';
import { Sector, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SubscriptionProvider from '../../../../../common/models/subscriptions/SubscriptionProvider';
import { formatSubscriptionPriceAmount } from '../../../../../common/models/subscriptions/SubscriptionPrice';
import { findRouteByKey } from '../../../../../common/routing/Route';
import routes from '../../../../../common/routing/routes';
import ScreenKey from '../../../../../common/routing/ScreenKey';
import * as classNames from 'classnames';

const
	chartMargin = 12,
	authorRoute = findRouteByKey(routes, ScreenKey.Author);

enum DataPointType {
	Placeholder,
	Platform,
	PaymentProvider,
	UnknownAuthor,
	KnownAuthor
}

type ChartDataPoint =
	{
		color: string,
		value: number
	} & (
		{
			type: DataPointType.Placeholder
		} | {
			type: DataPointType.Platform
		} | {
			type: DataPointType.PaymentProvider,
			provider: SubscriptionProvider
		} | {
			type: DataPointType.UnknownAuthor
			minutesRead: number,
		} | {
			type: DataPointType.KnownAuthor,
			author: {
				name: string,
				slug: string
			},
			minutesRead: number
		}
	);

type ActiveShapeParams = ChartDataPoint & {
	percent: number,
	midAngle: number,
	middleRadius: number,
	stroke: string,
	fill: string,
	cx: number,
	cy: number,
	innerRadius: number,
	outerRadius: number,
	maxRadius: number,
	startAngle: number,
	endAngle: number,
	paddingAngle: number
};

function generateColors(count: number) {
	// use HSL colors with constant values for S and L
	const
		hues: number[] = [],
		// start at a known nice color and walk around the 360 degrees circle of hues
		startDeg = 120,
		// take nice big steps to get a nice diversity of colors
		divisions = 4,
		stepDeg = 360 / divisions,
		// if we need more colors then start at an offset on subsequent walks
		offsetDeg = Math.round(stepDeg / Math.ceil(count / divisions));
	for (let i = 0; i < count; i++) {
		hues.push(startDeg + ((stepDeg * i) % 360) + (offsetDeg * Math.floor(i / divisions)));
	}
	return hues.map(
		hue => `hsl(${hue}, 60%, 50%)`
	)
}

function createDataPoints(report: SubscriptionDistributionReport) {
	// check for author distributions
	if (
		!hasAnyAuthorDistributions(report)
	) {
		return [{
			type: DataPointType.Placeholder as DataPointType.Placeholder,
			value: 1,
			color: 'hsl(0, 0%, 25%)'
		}];
	}
	// start by creating points for the platform and payment providers
	const points: ChartDataPoint[] = [
		{
			type: DataPointType.Platform,
			value: report.platformAmount,
			color: 'hsl(0, 0%, 25%)'
		}
	];
	if (report.appleAmount > 0) {
		points.push({
			type: DataPointType.PaymentProvider,
			provider: SubscriptionProvider.Apple,
			value: report.appleAmount,
			color: 'hsl(0, 0%, 50%)'
		});
	}
	if (report.stripeAmount > 0) {
		points.push({
			type: DataPointType.PaymentProvider,
			provider: SubscriptionProvider.Stripe,
			value: report.stripeAmount,
			color: 'hsl(0, 0%, 50%)'
		});
	}
	// check if there is an unknown author distribution
	if (report.unknownAuthorAmount > 0) {
		points.push({
			type: DataPointType.UnknownAuthor,
			minutesRead: report.unknownAuthorMinutesRead,
			value: report.unknownAuthorAmount,
			color: 'hsl(0, 0%, 75%)'
		});
	}
	// add all known authors along with their colors, sorting separately from previous points
	const authorColors = generateColors(report.authorDistributions.length);
	points.push(
		...report.authorDistributions
			.map(
				(author, index) => ({
					type: DataPointType.KnownAuthor as DataPointType.KnownAuthor,
					author: {
						name: author.authorName,
						slug: author.authorSlug
					},
					minutesRead: author.minutesRead,
					value: author.amount,
					color: authorColors[index],
				})
			)
			.sort(
				(a, b) => a.value - b.value
			)
	);
	return points;
}

function renderSector(params: ActiveShapeParams) {
	return (
		<Sector
			cx={params.cx}
			cy={params.cy}
			innerRadius={params.innerRadius}
			outerRadius={params.outerRadius}
			startAngle={params.startAngle}
			endAngle={params.endAngle}
			fill={params.fill}
			stroke={params.stroke}
		/>
	);
}

function renderActiveShape(params: ActiveShapeParams) {
	if (params.type === DataPointType.Placeholder) {
		return renderSector({
			...params,
			stroke: params.fill
		});
	}
	return (
		<g>
			{renderSector(params)}
			<Sector
				cx={params.cx}
				cy={params.cy}
				innerRadius={params.outerRadius + (chartMargin / 2)}
				outerRadius={params.outerRadius + chartMargin}
				startAngle={params.startAngle}
				endAngle={params.endAngle}
				fill={params.fill}
			/>
		</g>
	);
}

function getPreferredActiveIndex(points: ChartDataPoint[]) {
	const mostReadKnownAuthorIndex = points.indexOf(
		points
			.slice()
			.sort(
				(a, b) => b.value - a.value
			)
			.find(
				point => point.type === DataPointType.KnownAuthor
			)
	);
	if (mostReadKnownAuthorIndex !== -1) {
		return mostReadKnownAuthorIndex;
	}
	const unknownAuthorIndex = points.findIndex(
		point => point.type === DataPointType.UnknownAuthor
	);
	if (unknownAuthorIndex !== -1) {
		return unknownAuthorIndex;
	}
	const platformIndex = points.findIndex(
		point => point.type === DataPointType.Platform
	);
	if (platformIndex !== -1) {
		return platformIndex;
	}
	return points.length - 1;
}

function hasAnyAuthorDistributions(report: SubscriptionDistributionReport) {
	return report.unknownAuthorAmount > 0 || report.authorDistributions.length > 0;
}

interface Props {
	report: SubscriptionDistributionReport,
	onViewAuthor: (slug: string, name: string) => void
}
interface State {
	activeIndex: number,
	hasAnyAuthorDistributions: boolean
}
export default class DistributionChart extends React.Component<Props, State> {
	public static getDerivedStateFromProps(props: Props, state: State): State {
		// if we need to change the activeIndex in response to a distribution change it needs to happen
		// before the next render. updating afterwards in componentDidUpdate cancels the recharts animation
		const reportHasAuthorDistributions = hasAnyAuthorDistributions(props.report);
		if (
			!state.hasAnyAuthorDistributions && reportHasAuthorDistributions
		) {
			return {
				activeIndex: getPreferredActiveIndex(
					createDataPoints(props.report)
				),
				hasAnyAuthorDistributions: true
			}
		}
		if (
			state.hasAnyAuthorDistributions && !reportHasAuthorDistributions
		) {
			return {
				activeIndex: 0,
				hasAnyAuthorDistributions: false
			};
		}
		return null;
	}
	private readonly _setActiveIndex = (data: ChartDataPoint, index: number) => {
		this.setState({
			activeIndex: index
		});
	};
	private readonly _viewAuthor = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		this.props.onViewAuthor(event.currentTarget.dataset['slug'], event.currentTarget.dataset['name']);
	};
	constructor(props: Props) {
		super(props);
		this.state = {
			activeIndex: getPreferredActiveIndex(
				createDataPoints(props.report)
			),
			hasAnyAuthorDistributions: hasAnyAuthorDistributions(props.report)
		};
	}
	public render() {
		const
			points = createDataPoints(this.props.report),
			active = points[this.state.activeIndex];
		return (
			<div className="distribution-chart_n97yi3">
				<ResponsiveContainer aspect={1}>
					<PieChart
						margin={{
							top: chartMargin,
							right: chartMargin,
							bottom: chartMargin,
							left: chartMargin
						}}
					>
						<Pie
							activeIndex={this.state.activeIndex}
							activeShape={renderActiveShape}
							data={points}
							dataKey="value"
							innerRadius="80%"
							outerRadius="100%"
							onMouseEnter={this._setActiveIndex}
						>
							{points.map(
								(point, index) => (
									<Cell
										key={index}
										fill={point.color}
										stroke="#ccc"
									/>
								)
							)}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
				<div className="active-info">
					{active.type === DataPointType.Platform || active.type === DataPointType.PaymentProvider ?
						<div
							className={
								classNames(
									'logo',
									active.type === DataPointType.Platform ?
										'readup' :
										active.provider === SubscriptionProvider.Apple ?
											'apple' :
											'stripe'
								)
							}
						></div> :
						null}
					{active.type !== DataPointType.Placeholder ?
						<div className="title">
							{active.type === DataPointType.Platform ?
								'Platform fees' :
								active.type === DataPointType.PaymentProvider ?
									'Payment processor fees' :
										active.type === DataPointType.UnknownAuthor ?
											'Unknown authors' :
											<a
												href={authorRoute.createUrl({ 'slug': active.author.slug })}
												data-slug={active.author.slug}
												data-name={active.author.name}
												onClick={this._viewAuthor}
											>
												{active.author.name}
											</a>}
						</div> :
						null}
					{active.type === DataPointType.UnknownAuthor || active.type === DataPointType.KnownAuthor ?
						<div className="time">{active.minutesRead} min.</div> :
						null}
					{active.type === DataPointType.Placeholder ?
						<div className="message">You haven't read anything yet.</div> :
						<div className="amount">{formatSubscriptionPriceAmount(active.value)}</div>}
				</div>
			</div>
		)
	}
}