import {
	AuthSystemGuard,
	SystemPayload
} from "@docs/common/auth/guards/system-auth.guard"

import { CacheInterceptor } from "@nestjs/cache-manager"
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Inject,
	Logger,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Res,
	StreamableFile,
	UploadedFile,
	UseInterceptors
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"

import { Express, Response } from "express"

import { DeleteDocsService } from "@docs/storing/services/delete-docs-service/delete-docs.service"
import { DocsService } from "@docs/storing/services/docs-service/docs.service"
import { FilesService } from "@docs/storing/services/files-service/files.service"

import {
	IOC__SERVICE__DELETE_DOCS,
	IOC__SERVICE__DOCS,
	IOC__SERVICE__FILES
} from "@docs/shared/constants/ioc.constants"
import { ROUTER__VERSION_1 } from "@docs/shared/constants/router.constants"

import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"
import { FileDto } from "@docs/shared/dto/v1/db-dto/file/files.dto"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { FileTypeForDownloadPath } from "@docs/shared/enums/files.enum"

@Controller({
	path: "diadoc",
	version: ROUTER__VERSION_1
})
@UseInterceptors(CacheInterceptor)
@AuthSystemGuard()
@ApiBearerAuth()
@ApiTags("Diadoc v1")
export class DiadocController {
	private readonly logger = new Logger(DiadocController.name)

	constructor(
		@Inject(IOC__SERVICE__DOCS)
		private readonly docsService: DocsService,

		@Inject(IOC__SERVICE__FILES)
		private readonly filesService: FilesService,

		@Inject(IOC__SERVICE__DELETE_DOCS)
		private readonly deleteDocsService: DeleteDocsService
	) {}

	@Post()
	createDocument(
		@Body() createDocDto: CreateDocsDto,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	) {
		this.logger.log(
			`Создание документа DTO: ${JSON.stringify(createDocDto)}\nID системы: ${systemPayload?.system_id}`
		)
		return this.docsService.create(createDocDto, systemPayload)
	}

	@Post("upload/:docId")
	@UseInterceptors(FileInterceptor("file"))
	uploadFile(
		@Param("docId", new ParseUUIDPipe()) docId: string,
		@UploadedFile() file: Express.Multer.File,
		@Body() metadata: FileDto,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	) {
		this.logger.log(
			`Прикрепление файла к документу: ${docId}\nПрикрепление файла DTO: ${JSON.stringify(metadata)}\nID системы: ${systemPayload?.system_id}`
		)
		return this.filesService.upload(metadata, docId, file, systemPayload)
	}

	@Put("replace/:doc_id")
	replace() {
		return "Данный функционал недоступен"
	}

	@Put("upload/:doc_id/publish")
	setPublish(
		@Param("doc_id", new ParseUUIDPipe()) docId: string,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	) {
		this.logger.log(`Публикация документа: ${docId}
			ID системы: ${systemPayload?.system_id}`)
		return this.docsService.setPublish(docId, systemPayload)
	}

	@Get("service")
	servive() {
		return "Данный функционал недоступен"
	}

	@Get(":doc_id")
	getByDocId(
		@Param("doc_id", new ParseUUIDPipe()) docId: string,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	) {
		return new ForbiddenException(
			"Получение записей сервиса подписания запрещено"
		)
	}

	@Get(":id/:filetype")
	async getFile(
		@Param("id", new ParseUUIDPipe()) id: string,
		@Param("filetype") filetype: FileTypeForDownloadPath,
		@Res({ passthrough: true }) res: Response,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	) {
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

	@Put(":doc_id")
	update(
		@Param("doc_id", new ParseUUIDPipe()) docId: string,
		@Body() createDocDto: CreateDocsDto,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	) {
		return new ForbiddenException("Изменение через сервис подписания запрещено")
	}

	@Delete("delete/:doc_id")
	delete(
		@Param("doc_id", new ParseUUIDPipe()) docId: string,
		@SystemPayload() systemPayload: IJwtPayloadSystem
	) {
		this.logger.log(
			`Получен запрос на удаление документа docId=${docId} от системы ${systemPayload.system_id}`
		)
		return this.deleteDocsService.deleteFromSystem(docId, systemPayload)
	}
}
