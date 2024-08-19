import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { FilesService } from "./files.service"
import { DocsServiceDb } from "@docs/common/db/services/docs-service/docs.service"
import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"
import { IFileCleanerService } from "@docs/shared/interfaces/services/db/files-service.interfaces"

import {
	CONFIG__STORING_MONTHS_DOCUMENT_DRAFTS,
	CONFIG__STORING_MONTHS_FILES
} from "@docs/shared/constants/config.constants"
import {
	IOC__SERVICE__DOCS_DB,
	IOC__SERVICE__FILES,
	IOC__SERVICE__FILES_DB
} from "@docs/shared/constants/ioc.constants"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"

@Injectable()
export class FileCleanerService implements IFileCleanerService {
	private readonly logger = new Logger(FileCleanerService.name)

	constructor(
		private readonly configService: ConfigService,

		@Inject(IOC__SERVICE__FILES)
		private readonly filesService: FilesService,

		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesServiceDb: FilesServiceDb,

		@Inject(IOC__SERVICE__DOCS_DB)
		private readonly docsServiceDB: DocsServiceDb
	) {}

	public async deleteOldFiles(): Promise<void> {
		this.logger.log("Начинаю чистить файлы s3")

		try {
			await this.deleteOldestFiles()

			await this.deleteOldDocsFiles()
		} catch (error) {
			this.logger.error(
				`Не смог произвести очистку s3, error: ${error.message}`
			)

			return
		}

		this.logger.log("Закончил чистить файлы s3")
	}

	private async deleteOldestFiles(): Promise<void> {
		const countOfMonth: number =
			+this.configService.getOrThrow(CONFIG__STORING_MONTHS_FILES) || 6

		let oldFiles: Files[]

		try {
			oldFiles = await this.getOldFiles(countOfMonth)
		} catch (error) {
			const message: string = `Ошибка при поиске файлов в период ${countOfMonth} месяцев\nerror: ${error.message}`

			this.logger.error(message)
			throw new Error(message)
		}

		if (!oldFiles.length) {
			this.logger.log(
				`Не найдено устаревших файлов в период ${countOfMonth} месяцев`
			)

			return
		}

		for (const oldFile of oldFiles) {
			try {
				await this.filesService.deleteFileById(oldFile.id)
			} catch (error) {
				continue
			}
		}

		this.logger.log(
			`Все ${oldFiles.length} файлов, которые хранятся в системе более ${countOfMonth} месяцев успешно удалены`
		)
	}

	private async deleteOldDocsFiles(): Promise<void> {
		const countOfMonth: number =
			+this.configService.getOrThrow(CONFIG__STORING_MONTHS_DOCUMENT_DRAFTS) ||
			3

		let oldFiles: Files[]

		try {
			oldFiles = await this.getOldFiles(countOfMonth)
		} catch (error) {
			const message: string = `Ошибка при поиске файлов в период ${countOfMonth} месяцев\nerror: ${error.message}`

			this.logger.error(message)
			throw new Error(message)
		}

		if (!oldFiles.length) {
			this.logger.log(
				`Не найдено устаревших файлов в период ${countOfMonth} месяцев`
			)

			return
		}

		const oldDocumentsIds: string[] = []

		for (const oldFile of oldFiles) {
			if (!oldDocumentsIds.includes(oldFile.docs_id)) {
				oldDocumentsIds.push(oldFile.docs_id)
			}
		}

		for (const oldDocumentId of oldDocumentsIds) {
			try {
				await this.checkOldDocumentById(oldDocumentId)
			} catch (error) {
				continue
			}
		}
	}

	private async checkOldDocumentById(id: string): Promise<void> {
		let document: Docs

		try {
			document = await this.docsServiceDB.getById(id, ["files"])
		} catch (error) {
			const message: string = `Не получилось найти документ с id=${id}`

			this.logger.error(message)
			throw new Error(message)
		}

		const indexPrintForm: number = document.files.findIndex((file: Files) => {
			return file.is_print_form
		})

		const indexArchive: number = document.files.findIndex((file: Files) => {
			return file.is_archive
		})

		const indexMain: number = document.files.findIndex((file: Files) => {
			return file.is_main
		})

		if (indexPrintForm > -1 && indexArchive > -1 && indexMain > -1) {
			for (const file of document.files) {
				try {
					this.logger.log(`Найден устаревший файл file_id=${file.id}`)

					await this.filesService.deleteFileById(file.id)
				} catch (error) {
					continue
				}
			}
		}
	}

	private async getOldFiles(countOfMonth: number): Promise<Files[]> {
		this.logger.log(`Проверяю файлы созданные ранее ${countOfMonth} месяцев`)

		let oldFiles: Files[]

		try {
			oldFiles = await this.filesServiceDb.getFilesCreatedThen(
				countOfMonth,
				"month",
				false
			)
		} catch (error) {
			if (error instanceof InternalServerErrorException) {
				this.logger.error("Поиск файлов - ", error.message)
			}
		}

		if (!oldFiles.length) return []

		this.logger.log(
			`Найдено ${oldFiles.length} файлов созданных ранее ${countOfMonth} месяцев`
		)

		return oldFiles
	}
}
