import { ApiProperty } from "@nestjs/swagger"

import { IsString } from "class-validator"

export class AdminLoginDto {
	@IsString()
	@ApiProperty()
	username: string

	@IsString()
	@ApiProperty()
	password: string

	constructor(fields?: Partial<AdminLoginDto>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
