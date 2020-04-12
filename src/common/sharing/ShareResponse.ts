import ShareChannel from './ShareChannel';
import ShareForm from '../models/analytics/ShareForm';

export default interface ShareResponse {
	channels: ShareChannel[],
	completionHandler?: (data: ShareForm) => void
}