import ShareChannel from './ShareChannel';
import { TweetWebIntentParams } from './twitter';

interface EmailShareData {
	body: string,
	subject: string
}
export default interface ShareData {
	action: string,
	email: EmailShareData,
	text: string,
	url: string
}
export type ClipboardShareChannelData = {
	channel: ShareChannel.Clipboard,
	text: string
};
export type EmailShareChannelData = EmailShareData & {
	channel: ShareChannel.Email
};
export type TwitterShareChannelData = TweetWebIntentParams & {
	channel: ShareChannel.Twitter
};
export type ShareChannelData = ClipboardShareChannelData | EmailShareChannelData | TwitterShareChannelData;