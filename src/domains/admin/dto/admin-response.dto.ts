import { ApiProperty } from "@nestjs/swagger"

import { IsOptional, IsString } from "class-validator"

export class AdminResponseDto {
	@IsString()
	@ApiProperty()
	access_token: string

	@IsString()
	@ApiProperty()
	refresh_token: string

	@IsOptional()
	@ApiProperty()
	message?: string

	constructor(fields?: Partial<AdminResponseDto>) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
