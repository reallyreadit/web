export type BroadcastChannelMessageListener = (message: { data: any }) => void;
export interface BroadcastChannelInterface {
	addEventListener(type: 'message', listener: BroadcastChannelMessageListener): void,
	postMessage(message: any): void
}