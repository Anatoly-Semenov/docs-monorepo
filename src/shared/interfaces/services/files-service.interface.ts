import { Express } from "express"

import {
	FileDto,
	FileResponseDto
} from "@docs/shared/dto/v1/db-dto/file/files.dto"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

export interface IFilesService {
	upload(
		fileDto: FileDto,
		docId: string,
		file: Express.Multer.File,
		systemPayload: IJwtPayloadSystem
	): Promise<FileResponseDto>
}
