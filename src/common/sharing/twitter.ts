import { createQueryString } from '../routing/queryString';

// https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
export interface TweetWebIntentParams {
	text?: string,
	url?: string,
	hashtags?: string[],
	via?: string
}

export function createTweetWebIntentUrl(params: TweetWebIntentParams) {
	let queryStringParams: { [key: string]: string } = { };
	if (params.text) {
		queryStringParams['text'] = params.text;
	}
	if (params.url) {
		queryStringParams['url'] = params.url;
	}
	if (params.hashtags) {
		queryStringParams['hashtags'] = params.hashtags.join(',');
	}
	if (params.via) {
		queryStringParams['via'] = params.via;
	}
	const queryString = createQueryString(queryStringParams);
	return `https://twitter.com/intent/tweet${queryString}`;
}

export function openTweetComposerBrowserWindow(params: TweetWebIntentParams) {
	window.open(
		createTweetWebIntentUrl(params),
		'_blank',
		'height=300,location=0,menubar=0,toolbar=0,width=500'
	);
}