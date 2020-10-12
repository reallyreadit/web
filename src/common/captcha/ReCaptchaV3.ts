interface ExecutionResponse<In> {
	then: <Out>(handler: (value: In) => Out) => ExecutionResponse<Out>
}
export default interface ReCaptchaV3 {
	execute: (siteKey: string, options: { action: string }) => ExecutionResponse<string>
}