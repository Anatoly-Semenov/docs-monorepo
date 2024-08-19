import { randomUUID } from "crypto"

import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"

import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"
import { FilesService } from "@docs/storing/services/files-service/files.service"

import { CRUD__INITIATOR_DIADOC } from "@docs/shared/constants/crud.constants"
import {
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__FILES,
	IOC__SERVICE__FILES_DB
} from "@docs/shared/constants/ioc.constants"

import { GetDiadocFileDataByHeaders } from "@docs/shared/helpers/files.helper"

import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"

@Injectable()
export class FilesProcessingService {
	constructor(
		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesServiceDb: FilesServiceDb,

		@Inject(IOC__SERVICE__FILES)
		private readonly filesService: FilesService,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocService: DiadocClientService
	) {}

	private readonly logger = new Logger(FilesProcessingService.name)

	async downloadPrintingForms(diadocResponseFiles, docInstance: Docs) {
		const { filename, diadocId } = GetDiadocFileDataByHeaders(
			diadocResponseFiles.headers
		)
		const fileBuff: Buffer = diadocResponseFiles.data

		let sourceFileForThisDiadocId: Files
		try {
			sourceFileForThisDiadocId =
				await this.filesServiceDb.getByDiadocId(diadocId)
		} catch (e) {
			const errorMessage: string = `Ошибка считывания оригинального файла по diadocId=${diadocId}: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}

		this.logger.log(`Загрузка ПФ для файла ${sourceFileForThisDiadocId.id}`)

		try {
			await this.filesService.create(
				{
					file_id: sourceFileForThisDiadocId.source_id,
					created_by: CRUD__INITIATOR_DIADOC,
					need_recipient_signature: null,
					name_files: filename,
					is_print_form: true,
					is_archive: false,
					diadoc_id: diadocId,
					type_files: "",

					// Todo: add file_type
					file_type: null
				},
				fileBuff,
				docInstance
			)
		} catch (e) {
			const errorMessage: string = `Ошибка при создании файла печатной формы по diadocId=${diadocId}: ${e.message}`
			this.logger.error(errorMessage)
			throw new InternalServerErrorException(errorMessage)
		}
	}

	async downloadArchives(diadocResponseFiles, docInstance: Docs) {
		try {
			const diadocId: string = diadocResponseFiles.split(".")[4]
			const sourceFile: Files =
				await this.filesServiceDb.getByDiadocId(diadocId)

			this.logger.log(`Загрузка архива для файла id=${sourceFile.id}`)

			const file: Buffer = (
				await this.diadocService.getArchiveFile(diadocResponseFiles)
			).data

			await this.filesService.create(
				{
					file_id: sourceFile.source_id,
					created_by: CRUD__INITIATOR_DIADOC,
					need_recipient_signature: null,
					name_files: randomUUID(),
					is_print_form: false,
					is_archive: true,
					diadoc_id: diadocId,
					type_files: "",

					// Todo: add file_type
					file_type: null
				},
				file,
				docInstance
			)
		} catch (e) {
			this.logger.error(
				`Ошибка загрузки архива: ${e.message} для diadocResponseFiles=${diadocResponseFiles}`
			)
		}
	}
}
