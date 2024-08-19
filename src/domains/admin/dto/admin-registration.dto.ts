import { ApiProperty } from "@nestjs/swagger"

import { IsString, IsUUID } from "class-validator"

import { AdminLoginDto } from "./admin-login.dto"

export class AdminRegistrationDto extends AdminLoginDto {
	@IsUUID()
	@ApiProperty()
	system_id: string

	constructor(fields?: Partial<AdminRegistrationDto>) {
		super()

		if (fields) {
			Object.assign(this, fields)
		}
	}
}
