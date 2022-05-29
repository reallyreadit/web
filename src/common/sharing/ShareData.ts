// Copyright (C) 2022 reallyread.it, inc.
// 
// This file is part of Readup.
// 
// Readup is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
// 
// Readup is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License version 3 along with Foobar. If not, see <https://www.gnu.org/licenses/>.

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