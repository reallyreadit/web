export default interface ShareData {
	action: string,
	email: {
		body: string,
		subject: string
	},
	text: string,
	url: string
}