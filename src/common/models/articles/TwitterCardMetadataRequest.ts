import LinkType from "./LinkType";
export default interface TwitterCardMetadataRequest {
	slug: string;
	postId: string | null;
	linkType: LinkType;
}
