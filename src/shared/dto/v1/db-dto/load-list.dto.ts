import { ApiProperty } from "@nestjs/swagger"

import { IsOptional, IsString } from "class-validator"

import { ActionDto } from "@docs/shared/dto/common/action.dto"

export class LoadListDto<T = any> extends ActionDto<T> {
	@IsString()
	@ApiProperty({
		default: "load"
	})
	action: string

	@IsString()
	@IsOptional()
	@ApiProperty()
	page: number
}
