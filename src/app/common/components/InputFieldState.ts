import EventEmitter from '../EventEmitter';


export default class InputFieldState extends EventEmitter<{ change: { value: string, isValid: boolean } }> {
	private _value: string;
	private _isValid: boolean;
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
	}
	public handleChange(value: string, isValid: boolean) {
		this._value = value;
		this._isValid = isValid;
		this.emitEvent('change', { value, isValid });
	}
	public get value() {
		return this._value;
	}
	public get isValid() {
		return this._isValid;
	}
}