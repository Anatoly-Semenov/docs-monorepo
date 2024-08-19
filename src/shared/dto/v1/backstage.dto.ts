import { ApiProperty } from "@nestjs/swagger"

import { IsNumber, IsOptional, IsString } from "class-validator"

export class BackstageSetRedisDto {
	@IsString()
	@ApiProperty()
	key: string

	@IsString()
	@ApiProperty()
	value: string

	@IsOptional()
	@IsNumber()
	@ApiProperty({
		required: false
	})
	ttl?: number
}
