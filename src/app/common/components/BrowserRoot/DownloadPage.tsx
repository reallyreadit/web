import * as React from 'react';
import Button from '../../../../common/components/Button';
import Icon, {IconName} from '../../../../common/components/Icon';
// import Link from '../../../../common/components/Link';
import RouteLocation from '../../../../common/routing/RouteLocation';
import HomeHero from './HomeHero';

const renderDownloadOption = ({title, iconName, link, onOpenNewPlatformNotificationRequestDialog}:
		{title: string, iconName: IconName, link?: string, onOpenNewPlatformNotificationRequestDialog?: () => void}) => (
	<div className="download-option">
		<Icon name={iconName}/>
		<div className="download-option__details">
			<div className="download-option__details__title">{title}</div>
			{ title !== 'Android' ?
				<Button
					hrefPreventDefault={false}
					text="Download"
					size="large"
					intent="loud"
					href={link}
				/>
				: onOpenNewPlatformNotificationRequestDialog ?
					<div className="download-option__details__android">
						<div>Coming soon!</div>
						<Button
							text="Get Notified"
							size="normal"
							onClick={onOpenNewPlatformNotificationRequestDialog}
						/>
						{/* <Link
							text="Get Notified"
							onClick={onOpenNewPlatformNotificationRequestDialog}
						/> */}
					</div> : null
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
				{renderDownloadOption({title: 'iPhone & iPad', iconName: 'phone', link: 'https://apps.apple.com/us/app/readup-social-reading/id1441825432'})}
				{renderDownloadOption({title: 'Android', iconName: 'android', onOpenNewPlatformNotificationRequestDialog: props.onOpenNewPlatformNotificationRequestDialog})}
			</div>
			<div className="options-set options-desktop">
				<h2 className="options-set__heading">Desktop</h2>
				{renderDownloadOption({title: 'macOS', iconName: 'apple', link: 'https://apps.apple.com/us/app/readup-social-reading/id1441825432'})}
				{renderDownloadOption({title: 'Windows', iconName: 'windows', link: 'https://static.readup.com/downloads/windows/latest'})}
			</div>
		</div>
	</div>
);

type Services = {
	onOpenNewPlatformNotificationRequestDialog: () => void

};

export default function createScreenFactory<TScreenKey>(key: TScreenKey, services: Services) {
	return {
		create: (id: number, location: RouteLocation) => ({ id, key, location, title: 'Download Readup' }),
		render: () => React.createElement(downloadPage, {
			onOpenNewPlatformNotificationRequestDialog: services.onOpenNewPlatformNotificationRequestDialog
		})
	};
}