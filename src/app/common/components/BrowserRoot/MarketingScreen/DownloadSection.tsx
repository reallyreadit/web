import * as React from 'react';
import {NavOptions, NavReference} from '../../Root';
import DownloadButton from '../DownloadButton';

interface Props {
	onCopyAppReferrerTextToClipboard: (analyticsAction: string) => void,
	onNavTo: (ref: NavReference, options?: NavOptions) => boolean,
}

export const DownloadSection: React.FunctionComponent<Props> = (props: Props) => (
		<div className="download-section_45nqkz">
			<div className="download-section_45nqkz__details">
				<div className="download-section_45nqkz__details__heading">Download the app to get started</div>
				<p>Available on iPhone, iPad, Mac, Windows.<br/>Android in progress.</p>
			</div>
			<DownloadButton
				analyticsAction='download-section'
				onNavTo={props.onNavTo}
				onCopyAppReferrerTextToClipboard={props.onCopyAppReferrerTextToClipboard}
			/>
		</div>
		);

export default DownloadSection;