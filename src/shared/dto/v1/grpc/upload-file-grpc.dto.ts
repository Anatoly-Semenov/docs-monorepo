import { Express } from "express"

import {
	IsBoolean,
	IsByteLength,
	IsEnum,
	IsInstance,
	IsString
} from "class-validator"

import { GoogleTimestampDto } from "@docs/shared/dto/v1/google-timestamp.dto"

import { KindFiles } from "@docs/shared/enums/files.enum"

export class UploadFileGrpcDto {
	@IsByteLength(0, 1_000_000)
	file: Express.Multer.File // bytes

	@IsInstance(GoogleTimestampDto)
	begindate: GoogleTimestampDto

	@IsInstance(GoogleTimestampDto)
	enddate: GoogleTimestampDto

	@IsBoolean()
	needRecipientSignature: boolean

	@IsEnum(KindFiles)
	kindFiles: KindFiles

	@IsString()
	typeFiles: string

	@IsString()
	nameFiles: string

	@IsString()
	fileId: string

	@IsString()
	docId: string

	constructor(fields: UploadFileGrpcDto) {
		if (fields) {
			Object.assign(this, fields)
		}
	}
}
