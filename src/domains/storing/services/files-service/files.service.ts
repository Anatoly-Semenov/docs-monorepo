import internal from "stream"

import {
	BadRequestException,
	ConflictException,
	HttpStatus,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { Express } from "express"

import { S3ClientService } from "@docs/common/clients/providers/s3/s3-client.service"

import { ErrorLogsService } from "../error-logs-service/error-logs.service"
import { DocsRecipientServiceDb } from "@docs/common/db/services/docs-recipient-service/docs-recipient.service"
import { DocsServiceDb } from "@docs/common/db/services/docs-service/docs.service"
import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"
import { IFilesService } from "@docs/shared/interfaces/services/files-service.interface"

import { CRUD__INITIATOR_SYSTEM } from "@docs/shared/constants/crud.constants"
import {
	IOC__SERVICE__CLIENT_PROVIDER_S3,
	IOC__SERVICE__DOCS_DB,
	IOC__SERVICE__DOCS_RECIPIENT_DB,
	IOC__SERVICE__ERROR_LOGS,
	IOC__SERVICE__FILES_DB
} from "@docs/shared/constants/ioc.constants"

import { checkAccessToDoc } from "@docs/shared/helpers/auth.helper"

import { ValidatorInstance } from "@docs/shared/types/validator.types"
import { FileValidator } from "@docs/storing/validators/files.validator"

import { DocsRecipient } from "@docs/common/db/entities/docs-recipient.entity"
import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"

import { CreateFileDto } from "@docs/shared/dto/v1/db-dto/file/create-file.dto"
import {
	FileDto,
	FileResponseDto
} from "@docs/shared/dto/v1/db-dto/file/files.dto"
import { UploadFileGrpcDto } from "@docs/shared/dto/v1/grpc"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import {
	FileTypeForDownloadPath,
	KindFiles
} from "@docs/shared/enums/files.enum"

@Injectable()
export class FilesService implements IFilesService {
	private readonly logger = new Logger(FilesService.name)

	constructor(
		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesServiceDb: FilesServiceDb,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_S3)
		private readonly s3ClientService: S3ClientService,

		@Inject(IOC__SERVICE__DOCS_DB)
		private readonly docsServiceDb: DocsServiceDb,

		@Inject(IOC__SERVICE__DOCS_RECIPIENT_DB)
		private readonly docsRecipientService: DocsRecipientServiceDb,

		@Inject(IOC__SERVICE__ERROR_LOGS)
		private readonly errorLogsServive: ErrorLogsService,

		private readonly configService: ConfigService
	) {}

	private setError(message: string, error: any): void {
		this.logger.error(message)
		throw new InternalServerErrorException(
			`${message} | ${JSON.stringify(error)}`
		)
	}

	/**
	 * Создание файла - запись в БД и сохранение в s3
	 * @param fileDto DTO
	 * @param file файл
	 * @param docInstance инстанс документа, к которому прикреплён файл
	 * @returns Promise<FileResponseDto>
	 */
	public async create(
		fileDto: FileDto,
		file: Buffer,
		docInstance?: Docs
	): Promise<FileResponseDto> {
		try {
			this.logger.log(`Сохраняю файл в БД, source_id=${fileDto.file_id}`)

			const isMain: boolean =
				typeof fileDto.type_files === "boolean"
					? fileDto.type_files
					: fileDto.type_files === "true"

			const fileInstance: Files = await this.filesServiceDb.create(
				new CreateFileDto({
					need_recipient_signature: fileDto.need_recipient_signature === "true",
					created_by: fileDto?.created_by || CRUD__INITIATOR_SYSTEM,
					is_print_form: fileDto.is_print_form ?? false,
					is_archive: fileDto.is_archive ?? false,
					file_type: fileDto.file_type || null,
					document_kind: fileDto.kind_files,
					diadoc_id: fileDto.diadoc_id,
					source_id: fileDto.file_id,
					name: fileDto.name_files,
					docs: docInstance,
					is_main: isMain,

					/** Дополнительные данные неструктурированных файлов */
					begin_date: fileDto.begin_date ?? null,
					end_date: fileDto.end_date ?? null,
					currency_code:
						(docInstance.currency_code ??
						fileDto.kind_files === KindFiles.Torg13)
							? 643
							: null,
					price_list_effective_date: fileDto.price_list_effective_date ?? null
				})
			)

			const savedInstance: Files =
				await this.filesServiceDb.saveEntity(fileInstance)

			this.logger.log(`Сохраняю файл в S3, id=${savedInstance.id}`)

			await this.s3ClientService.writeFile(file, savedInstance.id)

			const savedFile: Files =
				await this.filesServiceDb.saveEntity(fileInstance)

			return new FileResponseDto(
				savedFile.docs_id,
				savedFile.name,
				HttpStatus.CREATED
			)
		} catch (error) {
			this.setError(
				`Ошибка при создании файла:
      fileDto: ${JSON.stringify(fileDto)}
      docId: ${docInstance?.id}
      error: ${error.message}`,
				error
			)
		}
	}

	/**
	 * Функция для получения стрима загрузки файла
	 * @param sourceId значение source_id (ID файла от смежных систем)
	 * @param filetype enum - archive/print_form
	 * @returns стрим чтения файла Promise<internal.Readable>
	 */
	public async downloadFile(
		sourceId: string,
		filetype: FileTypeForDownloadPath,
		systemPayload: IJwtPayloadSystem
	): Promise<internal.Readable> {
		this.logger.log(`Выполняю отправку файла ${sourceId} ${filetype}`)

		const file: Files = await this.filesServiceDb.findBySourceId(
			sourceId,
			filetype,
			["docs", "docs.system"]
		)

		if (!file) {
			this.logger.warn(`Не найден файл srcId: ${sourceId} type: ${filetype}`)
			throw new NotFoundException("Не найден файл для загрузки")
		}

		this.logger.log(`Проверка доступа системы к документу ${file?.docs?.id}`)
		checkAccessToDoc(file.docs, systemPayload.system_id)

		this.logger.log(`Запрашиваю файл ${file.id} из s3`)
		const fileStream = await this.s3ClientService.readFileStream(file.id)

		if (!fileStream) {
			this.logger.error(`Ошибка получения стрима из s3 по ID=${file.id}`)
			throw new InternalServerErrorException(
				"Внутренняя ошибка получения файла"
			)
		}

		const currentDate = new Date()
		this.logger.log(
			`Устанавливаю дату получения файла ${currentDate.toDateString()}`
		)
		file.received_date = currentDate
		await file.save()

		return fileStream
	}

	public async deleteFileById(id: string): Promise<void> {
		this.logger.log(`Удаляю файл id=${id}`)

		try {
			await this.s3ClientService.deleteFile(id)
			await this.filesServiceDb.setDeleteFromS3(id)

			this.logger.log(`Файл успешно удален id=${id}`)
		} catch (error) {
			const message: string = `Не получилось удалить файл id=${id}`

			this.logger.error(message)

			throw new Error(message)
		}
	}

	/**
	 * Функция для прикрепления файлов к полученному от смежных систем документу
	 * @param fileDto ДТО
	 * @param docId значение doc_id
	 * @param file файл
	 * @returns Promise<FileResponseDto>
	 */
	public async upload(
		fileDto: FileDto | UploadFileGrpcDto,
		docId: string,
		file: Express.Multer.File,
		systemPayload: IJwtPayloadSystem
	): Promise<FileResponseDto> {
		// @ts-ignore
		const fileData: FileDto = { ...fileDto }

		const docInstance: Docs = await this.docsServiceDb.getByDocIdWithAuth(
			docId,
			systemPayload
		)

		const docsRecipients: DocsRecipient[] =
			await this.docsRecipientService.getByDocumentId(docInstance.id)

		const fileNameArr: string[] = file?.originalname?.split(".")

		const originalNameFile: string = fileData.name_files

		fileData.file_type =
			fileNameArr && fileNameArr.length
				? `.${fileNameArr[fileNameArr.length - 1]}`
				: ""
		fileData.name_files = this.formatFileName(fileData.name_files)
		fileData.created_by = docInstance.created_by

		await this.diadocFileChecks(docInstance.id)

		const fileValidator: ValidatorInstance<string[]> = new FileValidator(
			fileData,
			file,
			docInstance,
			docsRecipients?.length > 1,
			originalNameFile
		)

		const validationErrors: string[] = fileValidator.validate()

		if (validationErrors.length) {
			const errMessage: string = `Ошибка валидации файла: file_id=${fileData.file_id},\n errors = ${validationErrors.join(",\n")}`

			this.logger.error(errMessage)
			await this.errorLogsServive.addError({
				doc_id: docId,
				errors: errMessage
			})
			throw new BadRequestException(errMessage)
		}

		// Проверка добавления файла в опубликованный документ
		if (docInstance.isPublish) {
			const errorMessage: string = `Попытка добавления файла file_id=${fileData.file_id} к опубликованному документу doc_id=${docInstance.doc_id}`
			this.logger.error(errorMessage)
			await this.errorLogsServive.addError({
				doc_id: docId,
				errors: errorMessage
			})
			throw new BadRequestException(errorMessage)
		}

		// Проверка дублирования файлов
		if (await this.filesServiceDb.checkDuplicate(fileData)) {
			const errorMessage: string = `Обнаружено дублирование файла file_id=${fileData.file_id}`
			this.logger.error(errorMessage)
			await this.errorLogsServive.addError({
				doc_id: docId,
				errors: errorMessage
			})
			throw new ConflictException(errorMessage)
		}

		this.logger.log(
			`Дубликаты не обнаружены, продолжаю создание файла file_id=${fileData.file_id}`
		)
		return this.create(fileData, file.buffer, docInstance)
	}

	private formatFileName(fileName: string): string {
		if (!fileName) return fileName

		const excludeSymbols: string[] = ["<", ">", ":", "/", "\\", "|", "?", "*"]

		for (const symbol of excludeSymbols) {
			fileName = fileName.replace(/[<,>:/\\|?*']/g, "")
		}

		/** Вырезаем все точки и пробелы с конца пока не дойдём до другого символа */
		return fileName.replaceAll(/[ .]+$/g, "")
	}

	private async diadocFileChecks(docId: string): Promise<void> {
		// todo: checks by isRoaming value

		const filesLimit: number = +this.configService.getOrThrow(
			"LIMIT_FILES_BY_DOCUMENT"
		)

		const countOfFiles: number =
			await this.filesServiceDb.countFilesByDocsId(docId)

		if (countOfFiles >= filesLimit) {
			const errorMessage: string = `Превышен лимит файлов для одного документа ${filesLimit}`
			await this.errorLogsServive.addError({
				doc_id: docId,
				errors: errorMessage
			})
			throw new BadRequestException(errorMessage)
		}
	}
}
