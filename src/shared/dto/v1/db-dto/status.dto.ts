import { IsBoolean, IsOptional, IsString } from "class-validator"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"

export class StatusDto {
	@IsString()
	severity: string

	@IsString()
	name: string

	@IsOptional()
	@IsString()
	mapped_status?: string

	@IsOptional()
	@IsString()
	service_status?: string

	@IsBoolean()
	primaryStatus: boolean

	fileInstance?: Files

	docInstance?: Docs
}
