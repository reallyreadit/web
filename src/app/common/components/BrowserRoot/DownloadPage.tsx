// Copyright (C) 2022 reallyread.it, inc.
//
// This file is part of Readup.
//
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
//
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

import * as React from 'react';
import Button from '../../../../common/components/Button';
import Icon, { IconName } from '../../../../common/components/Icon';
import {
	CompatibleBrowser,
	DeviceType,
	getBrowserIconName,
	getStoreUrl,
} from '../../../../common/DeviceType';
// import Link from '../../../../common/components/Link';
import RouteLocation from '../../../../common/routing/RouteLocation';
import DownloadButton from './DownloadButton';
import HomeHero from './HomeHero';
import { NavReference, NavOptions } from '../Root';
import Link from '../../../../common/components/Link';
import { SafariExtensionDialog } from './SafariExtensionDialog';

type Services = {
	onOpenDialog: (dialog: React.ReactNode) => void;
	onCloseDialog: () => void;
	onOpenNewPlatformNotificationRequestDialog: () => void;
	onCreateStaticContentUrl: (path: string) => string;
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean;
};

const renderDownloadOption = ({
	title,
	iconName,
	link,
	services,
}: {
	title: string;
	iconName: IconName;
	link?: string;
	services: Services;
}) => (
	<div className="download-option">
		<Icon name={iconName} />
		<div className="download-option__details">
			<div className="download-option__details__title">{title}</div>
			{title === 'Android' ? (
				<div className="download-option__details__android">
					<div>Coming soon!</div>
					<Button
						text="Get Notified"
						size="normal"
						onClick={services.onOpenNewPlatformNotificationRequestDialog}
					/>
					{/* <Link
							text="Get Notified"
							onClick={onOpenNewPlatformNotificationRequestDialog}
						/> */}
				</div>
			) : title === 'iPhone & iPad' ? (
				// only for iOS now;
				// TODO: specific buttons for Mac App Store, Windows
				<DownloadButton
					analyticsAction='download-page'
					onNavTo={services.onNavTo}
					deviceType={DeviceType.Ios}
					onCreateStaticContentUrl={services.onCreateStaticContentUrl}
					onOpenNewPlatformNotificationRequestDialog={
						services.onOpenNewPlatformNotificationRequestDialog
					}
				/>
			) : (
				// generic case
				<Button
					text="Download"
					iconLeft="arrow-down"
					size="large"
					intent="loud"
					onClick={services.onNavTo.bind(null, link)}
				/>
			)}
		</div>
	</div>
);

const downloadPage = (props: Services) => (
	<div className="download-page_4u78ip">
		<HomeHero
			title="The social reading platform."
			description={'Get Readup on all your devices!'}
		/>
		<div className="download-options">
			<div className="options-set options-mobile">
				<h2 className="options-set__heading">Mobile</h2>
				{renderDownloadOption({
					title: 'iPhone & iPad',
					iconName: 'phone',
					link: 'https://apps.apple.com/us/app/readup-social-reading/id1441825432',
					services: props,
				})}
				{renderDownloadOption({
					title: 'Android',
					iconName: 'android',
					services: props,
				})}
			</div>
			<div className="options-set web-reader">
				<h2 className="options-set__heading">Web Reader</h2>
				<p>
					You can browse articles on the web, but to read them with Readup,
					you'll need an extra extension.
				</p>
				<div className='browsers'>
					{(
						[
							DeviceType.DesktopChrome,
							DeviceType.DesktopFirefox,
							DeviceType.DesktopEdge,
							DeviceType.DesktopSafari,
						] as CompatibleBrowser[]
					).map((browserDeviceType) => {
						let linkProps =
							browserDeviceType === DeviceType.DesktopSafari
								? {
										onClick: () => {
											props.onOpenDialog(
												<SafariExtensionDialog
													onClose={props.onCloseDialog}
													onCreateStaticContentUrl={
														props.onCreateStaticContentUrl
													}
													onNavTo={props.onNavTo}
												/>
											);
										},
								  }
								: {
										onClick: props.onNavTo,
										href: getStoreUrl(browserDeviceType),
								  };
						return (
							<Link key={browserDeviceType} {...linkProps}>
								<Icon name={getBrowserIconName(browserDeviceType)} />
								<span>{browserDeviceType}</span>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	</div>
);

export default function createScreenFactory<TScreenKey>(
	key: TScreenKey,
	services: Services
) {
	return {
		create: (id: number, location: RouteLocation) => ({
			id,
			key,
			location,
			title: {
				default: 'Download Readup'
			},
		}),
		render: () =>
			React.createElement(downloadPage, {
				onOpenNewPlatformNotificationRequestDialog:
					services.onOpenNewPlatformNotificationRequestDialog,
				onOpenDialog: services.onOpenDialog,
				onCloseDialog: services.onCloseDialog,
				onCreateStaticContentUrl: services.onCreateStaticContentUrl,
				onNavTo: services.onNavTo,
			}),
	};
}
