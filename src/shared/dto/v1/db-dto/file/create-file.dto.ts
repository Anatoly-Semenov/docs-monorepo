import { ApiProperty } from "@nestjs/swagger"

import {
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString
} from "class-validator"

import { Docs } from "@docs/common/db/entities/docs.entity"

import { KindFiles } from "@docs/shared/enums/files.enum"

export class CreateFileDto {
	@ApiProperty()
	@IsOptional()
	@IsString()
	price_list_effective_date?: string | null

	@ApiProperty()
	@IsBoolean()
	need_recipient_signature: boolean

	@ApiProperty()
	@IsOptional()
	@IsString()
	link_diadoc_template?: string

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	is_print_form?: boolean

	@ApiProperty({
		enum: KindFiles
	})
	@IsOptional()
	@IsEnum(KindFiles)
	kind_files?: KindFiles

	@ApiProperty()
	@IsOptional()
	@IsString()
	document_kind?: string

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	currency_code?: number

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	is_archive?: boolean

	@ApiProperty()
	@IsOptional()
	@IsString()
	created_by?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	updated_by?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	deleted_by?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	begin_date?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	diadoc_id?: string

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	total_sum?: number

	@ApiProperty()
	@IsOptional()
	@IsString()
	file_type?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	source_id?: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	end_date?: string

	@ApiProperty()
	@IsBoolean()
	is_main: boolean

	@ApiProperty()
	@IsString()
	name?: string

	@ApiProperty()
	@IsOptional()
	docs: Docs

	constructor(fields: CreateFileDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
