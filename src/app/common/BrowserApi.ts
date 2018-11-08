import EventEmitter from "./EventEmitter";
import UserArticle from "../../common/models/UserArticle";
import UserAccount from "../../common/models/UserAccount";

export default abstract class extends EventEmitter<{
	'articleUpdated': UserArticle,
	'userUpdated': UserAccount
}> {
	public abstract setTitle(title: string): void;
	public abstract updateArticle(article: UserArticle): void;
	public abstract updateUser(user: UserAccount): void;
}