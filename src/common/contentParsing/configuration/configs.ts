import UniversalConfig from './UniversalConfig';
import PublisherConfig from './PublisherConfig';

export default {
	universal: {
		textContainerSearch: {
			nodeNameBlacklist: ['BUTTON', 'FIGURE', 'FORM', 'HEAD', 'IFRAME', 'NAV', 'NOSCRIPT', 'PICTURE', 'SCRIPT', 'STYLE'],
			attributeFullWordBlacklist: ['ad', 'carousel', 'gallery', 'related', 'share', 'subscribe', 'subscription'],
			attributeWordPartBlacklist: ['byline', 'caption', 'comment', 'download', 'interlude', 'image', 'meta', 'newsletter', 'photo', 'promo', 'pullquote', 'recirc', 'video'],
			itempropValueBlacklist: ['author', 'datePublished'],
			descendantNodeNameBlacklist: ['FORM', 'IFRAME'],
			additionalContentNodeNameBlacklist: ['ASIDE', 'FOOTER', 'HEADER'],
			additionalContentMaxDepthDecrease: 1,
			additionalContentMaxDepthIncrease: 1
		},
		textContainerContent: {
			regexBlacklist: [/^\[[^\]]+\]$/],
			singleSentenceOpenerBlacklist: ['►', 'click here', 'don\'t miss', 'listen to this story', 'read more', 'related article:', 'sign up for', 'sponsored:', 'this article appears in', 'watch:']
		},
		imageContainerSearch: {
			nodeNameBlacklist: ['FORM', 'HEAD', 'IFRAME', 'NAV', 'NOSCRIPT', 'SCRIPT', 'STYLE'],
			attributeFullWordBlacklist: ['ad', 'related', 'share', 'subscribe', 'subscription'],
			attributeWordPartBlacklist: ['interlude', 'newsletter', 'promo', 'recirc', 'video'],
			itempropValueBlacklist: [],
			descendantNodeNameBlacklist: ['FORM', 'IFRAME']
		},
		imageContainerMetadata: {
			contentRegexBlacklist: [/audm/i],
			contentRegexWhitelist: [],
			captionSelectors: ['figcaption', '[class*="caption"i]'],
			creditSelectors: ['[class*="credit"i]', '[class*="source"i]'],
			imageWrapperAttributeWordParts: ['image', 'img']
		},
		imageContainerContent: {
			nodeNameBlacklist: ['BUTTON'],
			nodeNameWhitelist: ['IMG', 'META', 'PICTURE', 'SOURCE'],
			attributeBlacklist: ['expand', 'icon', 'share']
		},
		textContainerSelection: {
			nodeNameWhitelist: ['ASIDE', 'BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'P', 'PRE', 'TABLE', 'UL'],
			ancestorNodeNameBlacklist: ['BLOCKQUOTE', 'LI', 'P']
		},
		wordCountTraversalPathSearchLimitMultiplier: 0.75
	} as UniversalConfig,
	publishers: [
		{
			hostname: 'article-test.dev.readup.com',
			transpositions: [
				{
					elementSelectors: [
						'.lead'
					],
					parentElementSelector: '.lead + div'
				}
			]
		},
		{
			hostname: 'churchofjesuschrist.org',
			transpositions: [
				{
					elementSelectors: [
						'.body-block > p',
						'.body-block > section:first-of-type > header > h2'
					],
					parentElementSelector: '.body-block > section:first-of-type'
				}
			]
		},
		{
			hostname: 'cnn.com',
			transpositions: [
				{
					elementSelectors: [
						'.el__leafmedia--sourced-paragraph > .zn-body__paragraph',
						'.l-container > .zn-body__paragraph:not(.zn-body__footer)',
						'.l-container > .zn-body__paragraph > h3'
					],
					parentElementSelector: '.zn-body__read-all'
				}
			]
		},
		{
			hostname: 'huffpost.com',
			transpositions: [
				{
					elementSelectors: [
						'#entry-text [data-rapid-subsec="paragraph"] > :not([data-rapid-subsec="paragraph"])'
					],
					parentElementSelector: '#entry-text'
				}
			]
		},
		{
			hostname: 'medium.com',
			textContainerSearch: {
				attributeWhitelist: ['ad']
			}
		},
		{
			hostname: 'nytimes.com',
			transpositions: [
				{
					elementSelectors: [
						'.story-body-1 > .story-body-text'
					],
					parentElementSelector: '.story-body-2'
				}
			]
		},
		{
			hostname: 'sciencedaily.com',
			transpositions: [
				{
					elementSelectors: [
						'p.lead'
					],
					parentElementSelector: 'div#text'
				}
			]
		},
		{
			hostname: 'stanfordmag.org',
			textContainerSearch: {
				attributeWhitelist: ['image']
			}
		},
		{
			hostname: 'telegraph.co.uk',
			transpositions: [
				{
					elementSelectors: [
						'#mainBodyArea > div[class$="Par"] > *'
					],
					parentElementSelector: '#mainBodyArea > .body'
				}
			]
		},
		{
			hostname: 'theatlantic.com',
			imageContainerSearch: {
				attributeBlacklist: ['callout']
			}
		},
		{
			hostname: 'topic.com',
			textContainerSearch: {
				attributeWhitelist: ['essay']
			}
		},
		{
			hostname: 'wired.com',
			textContainerSearch: {
				attributeBlacklist: ['inset']
			}
		}
	] as PublisherConfig[]
};