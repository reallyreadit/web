import * as React from 'react';
import Button from '../../../../../common/components/Button';
import ScreenKey from '../../../../../common/routing/ScreenKey';
import {NavReference} from '../../Root';

interface Props {
	onNavTo: (ref: NavReference) => void,
}

export const DownloadSection: React.FunctionComponent<Props> = (props: Props) => (
		<div className="download-section_45nqkz">
			<p className="download-section_45nqkz__details">
				<div className="download-section_45nqkz__details__heading">Download the app to get started</div>
				Available on iPhone, iPad, Mac, Windows.<br/>Android coming soon.</p>
			<Button
					hrefPreventDefault={false}
					text="Download App"
					size="large"
					intent="loud"
					onClick={() => props.onNavTo({key: ScreenKey.Download})}
			/>
		</div>
		);

export default DownloadSection;