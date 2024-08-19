import { ApiProperty } from "@nestjs/swagger"

import { IsOptional, IsString } from "class-validator"

export class ActionDto<T> {
	@IsString()
	@ApiProperty()
	action: string

	@IsOptional()
	data?: T

	constructor(fields?: Partial<ActionDto<T>>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
