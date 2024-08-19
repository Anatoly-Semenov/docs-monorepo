import {
	AuthSystemGuard,
	SystemPayload
} from "@docs/common/auth/guards/system-auth.guard"
import { HttpStatusCode } from "axios"

import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Inject,
	Logger,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	Res,
	StreamableFile,
	UploadedFile,
	UseInterceptors
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"

import { Express, Response } from "express"

import { FilesDownloadService } from "../services/files-service/files-download.service"
import { FilesService } from "@docs/storing/services/files-service/files.service"

import {
	IOC__SERVICE__FILES,
	IOC__SERVICE__FILES_DOWNLOAD
} from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_2 } from "@docs/shared/constants/router.constants"

import { CreateDownloadFileJobDto } from "@docs/shared/dto/v1/create-download-file-job.dto"
import {
	FileDto,
	FileResponseDto
} from "@docs/shared/dto/v1/db-dto/file/files.dto"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { FileTypeForDownloadPath } from "@docs/shared/enums/files.enum"
import { Message } from "@docs/shared/enums/message.enum"

@Controller({
	path: "files",
	version: ROUTER__VERSION_2
})
@AuthSystemGuard()
@ApiBearerAuth()
@ApiTags("Files v2")
export class FilesControllerV2 {
	private readonly logger = new Logger(FilesControllerV2.name)

	constructor(
		@Inject(IOC__SERVICE__FILES)
		private readonly filesService: FilesService,

		@Inject(IOC__SERVICE__FILES_DOWNLOAD)
		private readonly filesDownloadService: FilesDownloadService
	) {}

	@Get(":id")
	@ApiResponse({
		status: HttpStatusCode.Ok,
		description: "Скачивание файла"
	})
	@ApiResponse({
		status: HttpStatusCode.InternalServerError,
		description: "Ошибка скачивания файла"
	})
	async getFile(
		@Param("id", new ParseUUIDPipe()) id: string,
		@Query("filetype") filetype: FileTypeForDownloadPath,
		@Res({ passthrough: true }) res: Response,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	): Promise<StreamableFile> {
		this.logger.log(
			`Получен запрос на загрузку ${filetype} ${id}\nID системы: ${systemPayload?.system_id}`
		)
		try {
			const file = await this.filesService.downloadFile(
				id,
				filetype,
				systemPayload
			)

			switch (filetype) {
				case FileTypeForDownloadPath.PRINT_FORM:
					res.setHeader("Content-Type", "application/pdf")
					res.setHeader(
						"Content-Disposition",
						`attachment; filename="${id}.pdf"`
					)
					break
				case FileTypeForDownloadPath.ARCHIVE:
					res.setHeader(
						"Content-Disposition",
						`attachment; filename="${id}.zip"`
					)
					res.setHeader("Content-Type", "application/zip")
					break
				default:
					throw new BadRequestException(
						`Некорректно указан тип файла: ${filetype}, ` +
							`ожидаемые значения: ${FileTypeForDownloadPath.PRINT_FORM}, ${FileTypeForDownloadPath.ARCHIVE}`
					)
			}
			return new StreamableFile(file)
		} catch (e) {
			this.logger.error(
				`Возникла ошибка при получении файла (${e.message}), id=${id} filetype=${filetype}`
			)
			throw e
		}
	}

	@Post()
	@ApiResponse({
		status: HttpStatusCode.Ok,
		description: "Задача успешно создана"
	})
	async createDownloadJob(
		@Body() body: CreateDownloadFileJobDto,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	): Promise<string> {
		switch (body.action) {
			case "createDownloadJob":
				return await this.filesDownloadService.createDownloadJob(
					body,
					systemPayload
				)
			default:
				throw new BadRequestException(Message.Error.WRONG_ACTION)
		}
	}

	@Post(":id/upload")
	@UseInterceptors(FileInterceptor("file"))
	@ApiResponse({
		status: HttpStatusCode.BadRequest,
		description: "Данный документ уже сформирован"
	})
	@ApiResponse({
		status: HttpStatusCode.Conflict,
		description:
			"Файл с таким file_id уже прикреплён и/или имеет действующий статус. Документ будет отброшен вместе со всеми файлами"
	})
	@ApiResponse({
		status: HttpStatusCode.Ok,
		type: FileResponseDto
	})
	uploadFile(
		@Param("id", new ParseUUIDPipe()) id: string,
		@SystemPayload() systemPayload: IJwtPayloadSystem,
		@UploadedFile() file: Express.Multer.File,
		@Body() metadata: FileDto
	): Promise<FileResponseDto> {
		this.logger.log(
			`Прикрепление файла к документу: ${id}\nПрикрепление файла DTO: ${JSON.stringify(metadata)}\nID системы: ${systemPayload?.system_id}`
		)
		return this.filesService.upload(metadata, id, file, systemPayload)
	}
}
