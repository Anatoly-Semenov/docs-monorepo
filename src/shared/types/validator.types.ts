export abstract class ValidatorInstance<T = boolean> {
	constructor(...args: any) {}

	validate: () => T
}
