import * as React from 'react';
import Button from '../../../common/components/Button';
import Link from '../../../common/components/Link';
import {DeviceType} from '../../../common/DeviceType';
import {createUrl} from '../../../common/HttpEndpoint';
import {deviceTypeQueryStringKey} from '../../../common/routing/queryString';
import RouteLocation from '../../../common/routing/RouteLocation';
import ScreenKey from '../../../common/routing/ScreenKey';
import LoadingOverlay from './controls/LoadingOverlay';
import {NavMethod, NavOptions, NavReference, Screen } from './Root';

const SUPPORT_MAIL = "support@readup.com"
const AUTOLOAD_TIMEOUT = 5000;

type Services = {
	deviceType: DeviceType,
	location: RouteLocation,
	onNavTo: (ref: NavReference, options?: NavOptions) => void,
}

type State = {
	autoLoading: boolean
}

export class SubscriptionPage extends React.Component<Services, State> {

	// yes, when not on iOS or Desktop Safari
	private _shouldTryAutoLoad() {
		return !(
			(this.props.deviceType === DeviceType.Ios)
			||
			(this.props.deviceType === DeviceType.DesktopSafari)
			||
			(this.props.deviceType === DeviceType.Android)
		);
	}

	private _openInApp = () => {
		let targetUrl;
		if (this.props.deviceType === DeviceType.Ios) {
			targetUrl = createUrl(
				{
					host: 'reallyread.it',
					protocol: 'https'
				},
				this.props.location.path,
				{
					[deviceTypeQueryStringKey]: DeviceType.Ios
				}
			)
		} else {
			targetUrl = createUrl(
				{
					host: window.location.host,
					protocol: 'readup'
				},
				this.props.location.path,
			)
		}
		if (targetUrl) {
			window.location.href = targetUrl;
		}
	}

	constructor(props: Services) {
		super(props);
		this.state = {
			autoLoading: false
		}

		if (this._shouldTryAutoLoad()) {
			this.state = {
				autoLoading: true
			}
		}
	}

	public componentDidMount() {
		if (this.state.autoLoading) {
			setTimeout(() => {
				this.setState({
					autoLoading: false
				})
			}, AUTOLOAD_TIMEOUT);
			this._openInApp();
		}
	}

	public render() {

		const autoLoadExpired = this._shouldTryAutoLoad() && !this.state.autoLoading;

		return <div className="subscription-page_u5q1tc">
			<div className="content">
				<div className="top-content">
					<h1 className="heading-regular">{
						this._shouldTryAutoLoad() ?
							"Opening Readup..."  :
							this.props.deviceType === DeviceType.Android ?
							 "No Droid, No Fun 😢" :
							 "Subscribe to Readup" // iOS & Safari case
					}</h1>
					<div className="loader-wrapper">
						<p className="intro">Awesome that you want to subscribe!{" "}
							{
								this.props.deviceType === DeviceType.Android ?
									<>Unfortunately, Readup isn't available for Android yet. It's coming soon!<br/><br/> Get notified when &amp; check our other apps on the Downloads page.</>
									:
									"Open the app to continue."
							}
						</p>
						{
							this._shouldTryAutoLoad()
								&& <p><strong>If a browser dialog appears, click &quot;Open Readup&quot;</strong></p>
						}
						{ this.state.autoLoading ?
							<LoadingOverlay position="static" />
							: null
						}
					</div>
					<div className="button-wrapper">
						{
							autoLoadExpired && <p>App doesn't open? Try this button</p>
						}
						{
							this.props.deviceType === DeviceType.Android ?
							<Button
								intent="loud"
								size="large"
								text="Open Downloads"
								onClick={(ev) => this.props.onNavTo(
									{key: ScreenKey.Download},
									{method: NavMethod.ReplaceAll})
								}
							/>
							:
							(
								autoLoadExpired || !(this._shouldTryAutoLoad())
							) ?
								<Button
									intent="loud"
									size="large"
									text="Open App"
									onClick={this._openInApp} />
							:
							null
						}
						{ !(this.props.deviceType === DeviceType.Android) &&
						 	<p className="no-app">Don't have the app yet? <Link
							 screen={ScreenKey.Download}
							 onClick={this.props.onNavTo}
							 text="Download App" /></p>
						}
					</div>
				</div>
				<p className="support">
					Need help? Contact <Link
						href={`mailto:${SUPPORT_MAIL}`}
						text={SUPPORT_MAIL}
						onClick={this.props.onNavTo} />
				</p>
			</div>
		</div>
		}
	}

	export function createScreenFactory<TScreenKey>(key: TScreenKey, services: Omit<Services, 'location'>) {
		return {
			create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Subscribe to Readup' }),
			render: (state: Screen) => React.createElement(SubscriptionPage, {
				...services,
				location: state.location
			})
		};
	}

	export default SubscriptionPage;