import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator"

import { LogType } from "@docs/shared/enums/log.enum"

import { Http } from "@docs/shared/types"

export class CreateLogDto {
	@IsEnum(Http.Method)
	@IsOptional()
	http_method?: Http.Method

	@IsEnum(LogType)
	log_type: LogType

	@IsUUID()
	trace_id: string

	@IsString()
	@IsOptional()
	path?: string

	@IsString()
	@IsOptional()
	ip?: string

	@IsString()
	@IsOptional()
	user_agent?: string

	@IsNumber()
	@IsOptional()
	status_code?: number

	@IsUUID()
	@IsOptional()
	doc_id?: string

	constructor(fields: CreateLogDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
