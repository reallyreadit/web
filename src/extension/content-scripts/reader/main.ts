import Page from '../../../common/reading/Page';
import EventPageApi from './EventPageApi';
import parseDocumentMetadata from '../../../common/reading/parseDocumentMetadata';
import ContentElement from '../../../common/reading/ContentElement';
import Reader from '../../../common/reading/Reader';
import createPageParseResult from '../../../common/reading/createPageParseResult';
import UserArticle from '../../../common/models/UserArticle';
import ArticleLookupResult from '../../../common/models/ArticleLookupResult';
import ParseResult from '../../../common/contentParsing/ParseResult';
import styleArticleDocument from '../../../common/reading/styleArticleDocument';
import LazyScript from './LazyScript';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { mergeComment, updateComment } from '../../../common/comments';
import CommentThread from '../../../common/models/CommentThread';
import BrowserCommentsSection, { Props as CommentsSectionProps } from './components/BrowserCommentsSection';
import PostForm from '../../../common/models/social/PostForm';
import { createCommentThread } from '../../../common/models/social/Post';
import CommentForm from '../../../common/models/social/CommentForm';
import CommentAddendumForm from '../../../common/models/social/CommentAddendumForm';
import CommentRevisionForm from '../../../common/models/social/CommentRevisionForm';
import CommentDeletionForm from '../../../common/models/social/CommentDeletionForm';
import icons from '../../../common/svg/icons';
import ToasterService, { State as ToasterState } from '../../../common/services/ToasterService';
import ClipboardService from '../../../common/services/ClipboardService';
import DialogService, { State as DialogState } from '../../../common/services/DialogService';
import AsyncTracker from '../../../common/AsyncTracker';
import Global from './components/Global';
import Dialog from '../../../common/components/Dialog';

window.reallyreadit = {
	readerContentScript: {
		contentParser: new LazyScript(
			() => {
				eventPageApi.loadContentParser();
			}
		)
	}
};

let
	context: {
		contentParseResult: ParseResult,
		lookupResult: ArticleLookupResult,
		page: Page,
		isContentIdentificationDisplayEnabled: boolean
	} | null;

// event page interface
const eventPageApi = new EventPageApi({
	onArticleUpdated: event => {
		if (context && context.lookupResult) {
			context.lookupResult.userArticle = event.article;
		}
		embed?.pushState({
			article: event.article
		});
	},
	onCommentPosted: comment => {
		embed?.commentPosted(comment);
	},
	onCommentUpdated: comment => {
		embed?.commentUpdated(comment);
	},
	onToggleContentIdentificationDisplay: () => {
		if (context) {
			let styles: {
				primaryTextRootNodeBackgroundColor?: string,
				depthGroupWithMostWordsBackgroundColor?: string,
				primaryTextContainerBackgroundColor?: string,
				imageBorder?: string,
				imageCaptionBackgroundColor?: string,
				imageCreditBackgroundColor?: string,
				additionalTextBackgroundColor?: string
			};
			if (context.isContentIdentificationDisplayEnabled = !context.isContentIdentificationDisplayEnabled) {
				styles = {
					primaryTextRootNodeBackgroundColor: 'green',
					depthGroupWithMostWordsBackgroundColor: 'red',
					primaryTextContainerBackgroundColor: 'lime',
					imageBorder: '3px solid magenta',
					additionalTextBackgroundColor: 'yellow'
				};
			} else {
				styles = { };
			}
			(context.contentParseResult.primaryTextRootNode as HTMLElement).style.backgroundColor = styles.primaryTextRootNodeBackgroundColor || '';
			context.contentParseResult.depthGroupWithMostWords.members.forEach(
				member => {
					(member.containerElement as HTMLElement).style.backgroundColor = styles.depthGroupWithMostWordsBackgroundColor || ''
				}
			);
			context.contentParseResult.primaryTextContainerSearchResults.forEach(
				result => {
					(result.textContainer.containerElement as HTMLElement).style.backgroundColor = styles.primaryTextContainerBackgroundColor || '';
				}
			);
			context.contentParseResult.imageContainers.forEach(
				image => {
					(image.containerElement as HTMLElement).style.border = styles.imageBorder || '';
				}
			);
			context.contentParseResult.additionalPrimaryTextContainers.forEach(
				container => {
					(container.containerElement as HTMLElement).style.backgroundColor = styles.additionalTextBackgroundColor || '';
				}
			);
		}
	},
	onToggleReadStateDisplay: () => {
		if (context) {
			context.page.toggleReadStateDisplay();
		}
	}
});

// global ui
let globalUi: {
	clipboard: ClipboardService,
	dialog: DialogService,
	toaster: ToasterService
};
function insertGlobalUi() {
	globalUi = {
		clipboard: new ClipboardService(
			(content, intent) => {
				globalUi.toaster.addToast(content, intent);
			}
		),
		dialog: new DialogService({
			setState: delegate => {
				setState(delegate(state));
			}
		}),
		toaster: new ToasterService({
			asyncTracker: new AsyncTracker(),
			setState: (delegate: (prevState: ToasterState) => Pick<ToasterState, keyof ToasterState>) => {
				setState(delegate(state));
			}
		})
	};

	const iconsElement = document.createElement('div');
	iconsElement.innerHTML = icons;

	const componentStyleLink = document.createElement('link');
	componentStyleLink.rel = 'stylesheet';
	componentStyleLink.href = `chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-scripts/reader/bundle.css`;

	const reactRoot = document.createElement('div');

	const shadowRoot = document.body
		.appendChild(
			document.createElement('div')
		)
		.attachShadow({
			mode: 'open'
		});

	// react compatibility hack (https://github.com/facebook/react/issues/9242)
	Object.defineProperty(reactRoot, 'ownerDocument', { value: shadowRoot });
	(shadowRoot as any).createElement = (...args: any[]) => (document as any).createElement(...args);
	(shadowRoot as any).createElementNS = (...args: any[]) => (document as any).createElementNS(...args);
	(shadowRoot as any).createTextNode = (...args: any[]) => (document as any).createTextNode(...args);

	shadowRoot.append(componentStyleLink);
	shadowRoot.append(iconsElement);
	shadowRoot.append(reactRoot);

	let state: ToasterState & DialogState = {
		dialogs: [],
		toasts: []
	};

	function setState(nextState: Partial<ToasterState & DialogState>) {
		ReactDOM.render(
			React.createElement(
				Global,
				{
					clipboardService: globalUi.clipboard,
					dialogService: globalUi.dialog,
					toasterService: globalUi.toaster,
					...(
						state = {
							...state,
							...nextState
						}
					)
				}
			),
			reactRoot
		);
	}

	// initial render
	setState({ });
}

// embed
let embed: {
	commentPosted: (comment: CommentThread) => void,
	commentUpdated: (comment: CommentThread) => void,
	pushState: (state: { article: UserArticle }) => void
};
function insertEmbed(article: UserArticle) {
	embed = {
		commentPosted: comment => {
			if (state.comments && !state.comments.isLoading) {
				setState({
					comments: {
						...state.comments,
						value: mergeComment(comment, state.comments.value)
					}
				});
			}
		},
		commentUpdated: comment => {
			if (state.comments && !state.comments.isLoading) {
				setState({
					comments: {
						...state.comments,
						value: updateComment(comment, state.comments.value)
					}
				});
			}
		},
		pushState: state => {
			setState({
				...state
			});
		}
	};

	function postArticle(form: PostForm) {
		return eventPageApi
			.postArticle(form)
			.then(
				post => {
					context.lookupResult.userArticle = post.article;
					if (post.comment) {
						setState({
							article: post.article,
							comments: {
								...state.comments,
								value: mergeComment(
									createCommentThread(post),
									state.comments.value
								)
							}
						});
					} else {
						setState({
							article: post.article
						});
					}
					return post;
				}
			);
	}

	function postComment(form: CommentForm) {
		return eventPageApi
			.postComment(form)
			.then(result => {
				context.lookupResult.userArticle = result.article;
				setState({
					article: result.article,
					comments: {
						...state.comments,
						value: mergeComment(result.comment, state.comments.value)
					}
				});
			});
	}

	function postCommentAddendum(form: CommentAddendumForm) {
		return eventPageApi
			.postCommentAddendum(form)
			.then(
				comment => {
					setState({
						comments: {
							...state.comments,
							value: updateComment(comment, state.comments.value)
						}
					});
					return comment;
				}
			);
	}

	function postCommentRevision(form: CommentRevisionForm) {
		return eventPageApi
			.postCommentRevision(form)
			.then(
				comment => {
					setState({
						comments: {
							...state.comments,
							value: updateComment(comment, state.comments.value)
						}
					});
					return comment;
				}
			);
	}

	function deleteComment(form: CommentDeletionForm) {
		return eventPageApi
			.deleteComment(form)
			.then(
				comment => {
					setState({
						comments: {
							...state.comments,
							value: updateComment(comment, state.comments.value)
						}
					});
					return comment;
				}
			);
	}

	const iconsElement = document.createElement('div');
	iconsElement.innerHTML = icons;

	const componentStyleLink = document.createElement('link');
	componentStyleLink.rel = 'stylesheet';
	componentStyleLink.href = `chrome-extension://${window.reallyreadit.extension.config.extensionId}/content-scripts/reader/bundle.css`;

	const reactRoot = document.createElement('div');

	const shadowRoot = context.page.elements[context.page.elements.length - 1].element
		.insertAdjacentElement(
			'afterend',
			document.createElement('div')
		)
		.attachShadow({
			mode: 'open'
		});

	// react compatibility hack (https://github.com/facebook/react/issues/9242)
	Object.defineProperty(reactRoot, 'ownerDocument', { value: shadowRoot });
	(shadowRoot as any).createElement = (...args: any[]) => (document as any).createElement(...args);
	(shadowRoot as any).createElementNS = (...args: any[]) => (document as any).createElementNS(...args);
	(shadowRoot as any).createTextNode = (...args: any[]) => (document as any).createTextNode(...args);

	shadowRoot.append(componentStyleLink);
	shadowRoot.append(iconsElement);
	shadowRoot.append(reactRoot);

	let state: Pick<CommentsSectionProps, 'article' | 'comments' | 'user'> = {
		article,
		comments: {
			isLoading: true
		},
		user: context.lookupResult.user,
	};

	function setState(nextState: Partial<Pick<CommentsSectionProps, 'article' | 'comments' | 'user'>>) {
		ReactDOM.render(
			React.createElement(
				BrowserCommentsSection,
				{
					clipboardService: globalUi.clipboard,
					dialogService: globalUi.dialog,
					onDeleteComment: deleteComment,
					onPostArticle: postArticle,
					onPostComment: postComment,
					onPostCommentAddendum: postCommentAddendum,
					onPostCommentRevision: postCommentRevision,
					toasterService: globalUi.toaster,
					...(
						state = {
							...state,
							...nextState
						}
					)
				}
			),
			reactRoot
		);
	}

	eventPageApi
		.getComments(article.slug)
		.then(
			comments => {
				setState({
					comments: {
						isLoading: false,
						value: comments
					}
				});
			}
		);

	// initial render
	setState({ });
}

// reader
const reader = new Reader(
	event => {
		if (context) {
			eventPageApi
				.commitReadState(
					{
						readState: event.readStateArray,
						userPageId: context.lookupResult.userPage.id
					},
					event.isCompletionCommit
				)
				.then(article => {
					if (article.isRead) {
						if (embed) {
							embed.pushState({
								article
							});
						} else {
							insertEmbed(article);
						}
					}
				});
		}
	}
)

// begin fade out animation
const transitionAnimationDuration = 700;
document.body.style.transition = `opacity ${transitionAnimationDuration / 2}ms`;
document.body.style.opacity = '0';
document.body.classList.add('com_readup_activating_reader_mode');

// parse metadata
const metaParseResult = parseDocumentMetadata();

// begin content parsing and article lookup while the animation is happening
Promise
	.all<
		{
			contentParser: {
				prune: (parseResult: ParseResult) => void
			},
			contentParseResult: ParseResult,
			lookupResult: Promise<ArticleLookupResult>
		},
		void
	>([
		window.reallyreadit.readerContentScript.contentParser
			.get()
			.then(
				contentParser => {
					const contentParseResult = contentParser.parse();
					return {
						contentParser,
						contentParseResult,
						lookupResult: eventPageApi.registerPage(
							createPageParseResult(metaParseResult, contentParseResult)
						)
					};
				}
			),
		new Promise<void>(
			resolve => setTimeout(resolve, transitionAnimationDuration / 2)
		)	
	])
	.then(
		results => {
			// prune and style
			results[0].contentParser.prune(results[0].contentParseResult);
			styleArticleDocument(
				document,
				metaParseResult.metadata.article.title,
				metaParseResult.metadata.article.authors
					.map(
						author => author.name
					)
					.filter(
						name => !!name
					)
					.join(', ')
			);

			// set up the user interface
			insertGlobalUi();
			
			// begin fade in animation
			document.body.style.opacity = '1';
			document.body.classList.remove('com_readup_activating_reader_mode');
			
			// process the lookup result while the animation is happening
			Promise
				.all<
					{
						article: UserArticle,
						page: Page
					},
					void
				>([
					results[0].lookupResult.then(
						lookupResult => {
							// create page
							const page = new Page(
								results[0].contentParseResult.primaryTextContainers.map(
									container => new ContentElement(
										container.containerElement as HTMLElement,
										container.wordCount
									)
								)
							);

							// set the context
							context = {
								contentParseResult: results[0].contentParseResult,
								lookupResult,
								page,
								isContentIdentificationDisplayEnabled: false
							};
							page.setReadState(lookupResult.userPage.readState);
							reader.loadPage(page);

							// load the embed user interface
							if (lookupResult.userArticle.isRead) {
								insertEmbed(lookupResult.userArticle);
							}

							// return the article and page for the bookmark prompt
							return {
								article: lookupResult.userArticle,
								page
							};
						}
					),
					new Promise<void>(
						resolve => setTimeout(resolve, transitionAnimationDuration / 2)
					)
				])
				.then(
					results => {
						// display the bookmark prompt if needed
						if (
							!results[0].article.isRead &&
							results[0].page.getBookmarkScrollTop() > window.innerHeight
						) {
							globalUi.dialog.openDialog(
								React.createElement(
									Dialog,
									{
										children: 'Want to pick up where you left off?',
										closeButtonText: 'No',
										onClose: globalUi.dialog.closeDialog,
										onSubmit: () => {
											const bookmarkScrollTop = results[0].page.getBookmarkScrollTop();
											if (bookmarkScrollTop > 0) {
												window.scrollTo({
													behavior: 'smooth',
													top: bookmarkScrollTop
												});
											}
											return Promise.resolve();
										},
										size: 'small',
										submitButtonText: 'Yes',
										textAlign: 'center',
										title: 'Bookmark'
									}
								)
							);
						}
					}
				);
		}
	);

	// unload
window.addEventListener(
	'unload',
	() => {
		eventPageApi.unregisterPage();
	}
);