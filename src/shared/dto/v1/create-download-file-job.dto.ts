import { ApiProperty } from "@nestjs/swagger"

import { IsEnum, IsOptional, IsString } from "class-validator"

import { ActionDto } from "@docs/shared/dto/common/action.dto"

import { FileTypeForDownloadPath } from "@docs/shared/enums/files.enum"

export class CreateDownloadFileJobDto<T = any> extends ActionDto<T> {
	@IsEnum(FileTypeForDownloadPath)
	@ApiProperty({
		enum: FileTypeForDownloadPath,
		default: FileTypeForDownloadPath.ARCHIVE
	})
	file_type: FileTypeForDownloadPath

	@IsString()
	@ApiProperty()
	doc_id: string

	@IsString()
	@IsOptional()
	@ApiProperty()
	source_id: string

	constructor(fields: CreateDownloadFileJobDto) {
		super()

		if (fields) {
			Object.assign(this, fields)
		}
	}
}

export class CreateDownloadFileJobGrpcDto {
	@IsEnum(FileTypeForDownloadPath)
	@ApiProperty({
		enum: FileTypeForDownloadPath,
		default: FileTypeForDownloadPath.ARCHIVE
	})
	fileType: FileTypeForDownloadPath

	@IsString()
	@ApiProperty()
	docId: string

	@IsString()
	@IsOptional()
	@ApiProperty()
	sourceId: string

	constructor(fields: CreateDownloadFileJobGrpcDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
