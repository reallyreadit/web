export default interface ShareForm {
	id: string | null,
	action: string,
	activityType: string,
	completed: boolean | null,
	error: string | null
}