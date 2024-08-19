import { ApiProperty } from "@nestjs/swagger"

import { IsBoolean, IsOptional, IsString } from "class-validator"

import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"

export class UpdateDocsDto extends CreateDocsDto {
	@IsOptional()
	@IsString()
	@ApiProperty()
	messages_id: string

	@IsOptional()
	@IsString()
	@ApiProperty()
	link_diadoc?: string

	@IsOptional()
	@IsBoolean()
	@ApiProperty()
	isPublish?: boolean

	@IsOptional()
	@IsString()
	@ApiProperty()
	updated_by: string

	@IsOptional()
	@IsString()
	@ApiProperty()
	deleted_by: string

	@IsOptional()
	@IsString()
	@ApiProperty()
	packet_id: string

	@IsOptional()
	@IsString()
	@ApiProperty()
	inn: string

	constructor(fields?: Partial<UpdateDocsDto>) {
		if (fields) {
			super()
			Object.assign(this, fields)
		}
	}
}
