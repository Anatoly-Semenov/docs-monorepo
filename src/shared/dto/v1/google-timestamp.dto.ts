import { IsNumberOrString } from "@docs/shared/validators"
import { IsDefined, Validate } from "class-validator"

export class GoogleTimestampDto {
	@IsDefined()
	@Validate(IsNumberOrString)
	nanos: number | string

	@IsDefined()
	@Validate(IsNumberOrString)
	seconds: number | string

	constructor(fields: GoogleTimestampDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
