import { Job } from "bull"

import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common"

import { RedisBullClientService } from "@docs/common/clients/providers/redis-bull/redis-bull-client.service"

import { DocsServiceDb } from "@docs/common/db/services/docs-service/docs.service"
import { FilesServiceDb } from "@docs/common/db/services/files-service/files.service"

import {
	IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL,
	IOC__SERVICE__DOCS_DB,
	IOC__SERVICE__FILES_DB
} from "@docs/shared/constants/ioc.constants"

import { Files } from "@docs/common/db/entities/files.entity"

import { CreateDownloadFileJobDto } from "@docs/shared/dto/v1/create-download-file-job.dto"

import { IJwtPayloadSystem } from "@docs/shared/interfaces/jwt-payload.interface"

import { FileTypeForDownloadPath } from "@docs/shared/enums/files.enum"

@Injectable()
export class FilesDownloadService {
	private readonly logger = new Logger(FilesDownloadService.name)

	constructor(
		@Inject(IOC__SERVICE__CLIENT_PROVIDER_REDIS_BULL)
		private readonly redisBullClientService: RedisBullClientService,

		@Inject(IOC__SERVICE__FILES_DB)
		private readonly filesServiceDb: FilesServiceDb,

		@Inject(IOC__SERVICE__DOCS_DB)
		private readonly docsServiceDb: DocsServiceDb
	) {}

	public async createDownloadJob(
		data: CreateDownloadFileJobDto,
		systemPayload: IJwtPayloadSystem
	): Promise<string> {
		this.logger.log(
			`Создание задачи на скачивание file_type=${data.file_type} по ${data.doc_id} из диадок`
		)

		await this.docsServiceDb.checkAccessToDoc(
			{ doc_id: data.doc_id },
			systemPayload.system_id
		)

		let filesIds: string[] = []

		if (data.source_id) {
			const fileInstanceFile: Files = await this.filesServiceDb.findBySourceId(
				data.source_id,
				data.file_type
			)

			if (fileInstanceFile) {
				filesIds.push(fileInstanceFile.id)
			}
		} else {
			filesIds = [
				...(await this.docsServiceDb.getFilesIdsByDocId(data.doc_id, true))
			]
		}

		const diadocIds: string[] =
			await this.filesServiceDb.getDiadocIdsByFileIds(filesIds)

		if (!data.file_type) {
			throw new BadRequestException("Не корректно указанно поле file_type")
		}

		await Promise.all(
			diadocIds.map((diadocId: string): Promise<Job> => {
				switch (data.file_type) {
					case FileTypeForDownloadPath.PRINT_FORM:
						return this.redisBullClientService.addDownloadPrintFormJob({
							diadocId
						})
					case FileTypeForDownloadPath.ARCHIVE:
						return this.redisBullClientService.addDownloadArchiveJob({
							diadocId
						})
					default:
						break
				}
			})
		)

		const successMessage: string = `Задача на скачивание file_type=${data.file_type} по ${data.doc_id} из диадок успешно создана`
		this.logger.log(successMessage)

		return successMessage
	}
}
