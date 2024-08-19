import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from "class-validator"

@ValidatorConstraint({ name: "boolean-or-string-boolean", async: false })
export class IsBooleanOrStringBoolean implements ValidatorConstraintInterface {
	validate(text: any, args: ValidationArguments) {
		return typeof text === "boolean" || text === "true" || text === "false"
	}

	defaultMessage(args: ValidationArguments) {
		return `($value) must be boolean or "true" or "false"`
	}
}
