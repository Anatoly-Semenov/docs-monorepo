import { ApiProperty } from "@nestjs/swagger"

import { IsString } from "class-validator"

export class SystemTokenRequestDto {
	@IsString()
	@ApiProperty({
		type: String,
		default: "http://signmachine.ru"
	})
	system_link: string

	@IsString()
	@ApiProperty({
		type: String,
		default: "name"
	})
	system_name: string
}
