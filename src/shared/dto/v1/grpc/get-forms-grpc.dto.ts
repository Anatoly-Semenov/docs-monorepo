import { IsEnum, IsUUID } from "class-validator"

import { FileTypeForDownloadPath } from "@docs/shared/enums/files.enum"

export class GetFormsGrpcDto {
	@IsUUID()
	sourceId: string

	@IsEnum({
		enum: FileTypeForDownloadPath
	})
	fileType: FileTypeForDownloadPath

	constructor(fields: GetFormsGrpcDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
