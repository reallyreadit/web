import * as React from 'react';
import Button from '../../../../common/components/Button';
import Icon, {IconName} from '../../../../common/components/Icon';
import {DeviceType} from '../../../../common/DeviceType';
// import Link from '../../../../common/components/Link';
import RouteLocation from '../../../../common/routing/RouteLocation';
import DownloadButton from './DownloadButton';
import HomeHero from './HomeHero';

type Services = {
	onOpenNewPlatformNotificationRequestDialog: () => void,
	onCreateStaticContentUrl: (path: string) => string
};

const renderDownloadOption = ({title, iconName, link, services}:
		{title: string, iconName: IconName, link?: string, services: Services}) => (
	<div className="download-option">
		<Icon name={iconName}/>
		<div className="download-option__details">
			<div className="download-option__details__title">{title}</div>
			{ title === 'Android' ?
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
					</div> :
				title === 'iPhone & iPad' ? // only for iOS now;
				// TODO: specific buttons for Mac App Store, Windows
					<DownloadButton
						analyticsAction='download-page'
						onNavTo={() => false}
						buttonType='platform'
						deviceType={DeviceType.Ios}
						onCreateStaticContentUrl={services.onCreateStaticContentUrl}

					/>
				: // generic case
					<Button
					hrefPreventDefault={false}
					text="Download"
					size="large"
					intent="loud"
					href={link}
				/>
		}
		</div>
	</div>
)

const downloadPage = (props: Services) => (
	<div className="download-page_4u78ip">
		<HomeHero
			title="The world's best reading app."
			description={"Get Readup on all your devices"}
		/>
		<div className="download-options">
			<div className="options-set options-mobile">
				<h2 className="options-set__heading">Mobile</h2>
				{renderDownloadOption({title: 'iPhone & iPad', iconName: 'phone', link: 'https://apps.apple.com/us/app/readup-social-reading/id1441825432', services: props})}
				{renderDownloadOption({title: 'Android', iconName: 'android', services: props})}
			</div>
			<div className="options-set options-desktop">
				<h2 className="options-set__heading">Desktop</h2>
				{renderDownloadOption({title: 'macOS', iconName: 'apple', link: 'https://apps.apple.com/us/app/readup-social-reading/id1441825432', services: props})}
				{renderDownloadOption({title: 'Windows', iconName: 'windows', link: 'https://static.readup.com/downloads/windows/ReadupSetup.exe', services: props})}
				{renderDownloadOption({title: 'Linux (.deb)', iconName: 'linux', link: 'https://static.readup.com/downloads/linux/latest', services: props})}
			</div>
		</div>
	</div>
);


export default function createScreenFactory<TScreenKey>(key: TScreenKey, services: Services) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Download Readup' }),
		render: () => React.createElement(downloadPage, {
			onOpenNewPlatformNotificationRequestDialog: services.onOpenNewPlatformNotificationRequestDialog,
			onCreateStaticContentUrl: services.onCreateStaticContentUrl
		})
	};
}