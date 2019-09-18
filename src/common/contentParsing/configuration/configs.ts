import UniversalConfig from './UniversalConfig';
import PublisherConfig from './PublisherConfig';
import { LazyImageStrategy } from '../processLazyImages';

export default {
	universal: {
		textContainerSearch: {
			additionalContentNodeNameBlacklist: ['ASIDE', 'FOOTER', 'HEADER'],
			additionalContentMaxDepthDecrease: 1,
			additionalContentMaxDepthIncrease: 1,
			descendantNodeNameBlacklist: ['FORM'],
			nodeNameBlacklist: ['BUTTON', 'FIGURE', 'FORM', 'HEAD', 'IFRAME', 'NAV', 'NOSCRIPT', 'PICTURE', 'SCRIPT', 'STYLE'],
			selectorBlacklist: ['[itemprop="author"], [itemprop="datePublished"]']
		},
		textContainerFilter: {
			attributeFullWordBlacklist: ['ad', 'carousel', 'gallery', 'related', 'share', 'subscribe', 'subscription'],
			attributeWordPartBlacklist: ['byline', 'caption', 'comment', 'download', 'interlude', 'image', 'meta', 'newsletter', 'photo', 'promo', 'pullquote', 'recirc', 'video'],
			blacklistSelectors: [],
			regexBlacklist: [/^\[[^\]]+\]$/],
			singleSentenceOpenerBlacklist: ['►', 'click here', 'check out', 'don\'t miss', 'listen to this story', 'read more', 'related article:', 'sign up for', 'sponsored:', 'this article appears in', 'watch:']
		},
		imageContainerSearch: {
			descendantNodeNameBlacklist: ['FORM', 'IFRAME'],
			nodeNameBlacklist: ['FORM', 'HEAD', 'IFRAME', 'NAV', 'SCRIPT', 'STYLE'],
			selectorBlacklist: []
		},
		imageContainerFilter: {
			attributeFullWordBlacklist: ['ad', 'related', 'share', 'subscribe', 'subscription'],
			attributeWordPartBlacklist: ['interlude', 'newsletter', 'promo', 'recirc', 'video'],
			blacklistSelectors: []
		},
		imageContainerMetadata: {
			contentRegexBlacklist: [/audm/i],
			contentRegexWhitelist: [],
			captionSelectors: ['figcaption', '[class*="caption"i]', '[itemProp*="caption"i]', '[itemProp*="description"i]'],
			creditSelectors: ['[class*="credit"i]', '[class*="source"i]', '[itemProp*="copyrightHolder"i]'],
			imageWrapperAttributeWordParts: ['image', 'img', 'photo']
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
			hostname: 'ablogtowatch.com',
			textContainerSearch: {
				selectorBlacklist: ['.ablog-adlabel']
			}
		},
		{
			hostname: '99u.adobe.com',
			textContainerFilter: {
				attributeFullWordBlacklist: ['blockquote']
			}
		},
		{
			hostname: 'bostonglobe.com',
			transpositions: [
				{
					elementSelectors: [
						'.article > .lead > *'
					],
					parentElementSelector: '.article > .body'
				}
			]
		},
		{
			hostname: 'cnbc.com',
			contentSearchRootElementSelector: '.ArticleBody-articleBody'
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
			hostname: 'abcnews.go.com',
			textContainerSearch: {
				selectorBlacklist: ['[class*="insert"]']
			}
		},
		{
			hostname: 'governing.com',
			imageStrategy: LazyImageStrategy.GoverningImgSrcCorrection
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
			hostname: 'insider.com',
			imageStrategy: LazyImageStrategy.PostLoadImgTag
		},
		{
			hostname: 'invisionapp.com',
			imageContainerSearch: {
				selectorBlacklist: ['div[class^="TweetQuotecomponent"]']
			}
		},
		{
			hostname: 'kotaku.com',
			imageStrategy: LazyImageStrategy.FigureImgDataSrc
		},
		{
			hostname: 'medium.com',
			textContainerFilter: {
				attributeFullWordWhitelist: ['ad']
			},
			imageStrategy: LazyImageStrategy.MediumScaleUp
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
			],
			imageStrategy: LazyImageStrategy.NytFigureImageObject,
			textContainerSearch: {
				selectorBlacklist: ['[id*="ad"], .epkadsg3, .etfikam0, .ez3869y0']
			},
			imageContainerSearch: {
				selectorBlacklist: ['[id*="ad"], .epkadsg3, .etfikam0, .ez3869y0']
			}
		},
		{
			hostname: 'article-test.dev.readup.com',
			transpositions: [
				{
					elementSelectors: [
						'.lead'
					],
					parentElementSelector: '.lead + div'
				}
			],
			imageStrategy: LazyImageStrategy.PostLoadImgTag
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
			hostname: 'sinocism.com',
			textContainerFilter: {
				blacklistSelectors: [
					() => {
						const footer = Array
							.from(document.getElementsByTagName('p'))
							.find(element => element.textContent.toLowerCase().startsWith('this week’s issues of sinocism'));
						if (footer) {
							return [
								footer,
								...Array
									.from(footer.parentElement.children)
									.filter(sibling => footer.compareDocumentPosition(sibling) & Node.DOCUMENT_POSITION_FOLLOWING)
							];
						}
						return [];
					}
				]
			}
		},
		{
			hostname: 'techrepublic.com',
			textContainerFilter: {
				blacklistSelectors: [
					() => {
						const footer = Array
							.from(document.getElementsByTagName('h2'))
							.find(element => element.textContent.toLowerCase().startsWith('also see'));
						if (footer && footer.nextElementSibling) {
							return [footer, footer.nextElementSibling];
						}
						return [];
					}
				]
			}
		},
		{
			hostname: 'theatlantic.com',
			imageContainerSearch: {
				selectorBlacklist: ['.callout']
			},
			imageStrategy: LazyImageStrategy.AtlanticFigureImgDataSrcset
		},
		{
			hostname: 'thedailybeast.com',
			contentSearchRootElementSelector: 'article.Body'
		},
		{
			hostname: 'thenewatlantis.com',
			textContainerSearch: {
				selectorBlacklist: ['.author, .epigraph, [style*="BellMT"], h2']
			},
			imageContainerSearch: {
				selectorBlacklist: ['[style*="BellMT"]']
			}
		},
		{
			hostname: 'vanityfair.com',
			imageStrategy: LazyImageStrategy.NoscriptImgContent
		},
		{
			hostname: 'variety.com',
			contentSearchRootElementSelector: 'article.c-content'
		},
		{
			hostname: 'vice.com',
			contentSearchRootElementSelector: '.article__body'
		},
		{
			hostname: 'washingtonpost.com',
			imageStrategy: LazyImageStrategy.WashingtonPostScaleUp,
			textContainerFilter: {
				attributeFullWordBlacklist: ['interstitial']
			}
		},
		{
			hostname: 'wired.com',
			textContainerFilter: {
				attributeFullWordBlacklist: ['inset'],
				blacklistSelectors: [
					() => {
						const footer = Array
							.from(document.getElementsByTagName('h3'))
							.find(element => element.textContent.toLowerCase().startsWith('more great wired stories'));
						if (footer && footer.nextElementSibling) {
							return [footer, footer.nextElementSibling];
						}
						return [];
					}
				]
			},
			imageContainerSearch: {
				selectorBlacklist: ['.inset']
			}
		},
		{
			hostname: 'news.harvard.edu',
			textContainerFilter: {
				attributeFullWordBlacklist: ['explore']
			}
		},
		{
			hostname: 'dark-mountain.net',
			transpositions: [
				{
					elementSelectors: [
						'.entry-content > div > .component--drop-cap',
						'.entry-content > div > p'
					],
					parentElementSelector: '.entry-content'
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
			hostname: 'telegraph.co.uk',
			transpositions: [
				{
					elementSelectors: [
						'#mainBodyArea > div[class$="Par"] > *'
					],
					parentElementSelector: '#mainBodyArea > .body'
				}
			]
		}
	] as PublisherConfig[]
};